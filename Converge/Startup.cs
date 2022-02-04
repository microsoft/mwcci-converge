// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using AutoWrapper;
using Converge.Jobs;
using Converge.Middleware;
using Converge.Models;
using Converge.Services;
using Cronos;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Web;
using Microsoft.Net.Http.Headers;
using Microsoft.OpenApi.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Converge
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddMicrosoftIdentityWebApi(Configuration)
                .EnableTokenAcquisitionToCallDownstreamApi()
                .AddMicrosoftGraph(Configuration.GetSection("Graph"))
                .AddInMemoryTokenCaches();

            services.AddControllers();
            services.AddHttpClient();
            services.AddMvcCore().AddNewtonsoftJson();

            RegisterSwagger(services);

            // We expect most of our users to be in Pacific Standard Time and will run jobs at midnight
            if (!string.IsNullOrEmpty(Configuration["JobSchedules:PredictorSchedule"]))
            {
                try
                {
                    CronExpression.Parse(Configuration["JobSchedules:PredictorSchedule"]);
                    services.AddCronJob<LocationPredictorJob>(c =>
                    {
                        c.TimeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(Constant.TimeZonePST);
                        c.CronExpression = Configuration["JobSchedules:PredictorSchedule"];
                    });
                } catch
                {
                    // do not schedule if config is invalid
                }
            }

            // We expect most of our users to be in Pacific Standard Time this job will run at 11PM, before the predictor job
            if (!string.IsNullOrEmpty(Configuration["JobSchedules:SyncPlacesSchedule"]))
            {
                try
                {
                    CronExpression.Parse(Configuration["JobSchedules:SyncPlacesSchedule"]);
                    services.AddCronJob<PlaceSyncJob>(c =>
                    {
                        c.TimeZoneInfo = TimeZoneInfo.FindSystemTimeZoneById(Constant.TimeZonePST);
                        c.CronExpression = Configuration["JobSchedules:SyncPlacesSchedule"];
                    });
                }
                catch
                {
                    // do not schedule if config is invalid
                }
            }

            services.AddApplicationInsightsTelemetry(Configuration["AppInsightsInstrumentationKey"]);
            RegisterServices(services);
            RegisterValidators(services);

            // In production, the React files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILogger<Startup> logger, IHostApplicationLifetime lifetime)
        {
            logger.LogInformation(
                "Configuring for {Environment} environment",
                env.EnvironmentName);

            bool isDevelopment = env.IsDevelopment();
            if (isDevelopment)
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Values Api V1");
            });

            app.UseApiResponseAndExceptionWrapper(new AutoWrapperOptions { ShowStatusCode = true, IsApiOnly = false, WrapWhenApiPathStartsWith = "/api", IsDebug = isDevelopment });

            app.UseHttpsRedirection();

            app.UseStaticFiles();

            app.Use(async (context, next) =>
            {
                context.Response.Headers.Add("X-Frame-Options", "ALLOW-FROM https://teams.microsoft.com/");
                context.Response.Headers.Add("Content-Security-Policy", "frame-ancestors teams.microsoft.com *.teams.microsoft.com *.skype.com");
                await next();
            });

            app.UseSpaStaticFiles(new StaticFileOptions()
            {
                OnPrepareResponse = ctx =>
                {
                    // Do not cache explicit `/index.html` or any other files.  See also: `DefaultPageStaticFileOptions` below for implicit "/index.html"
                    var headers = ctx.Context.Response.GetTypedHeaders();
                    headers.CacheControl = new CacheControlHeaderValue
                    {
                        Public = true,
                        MaxAge = TimeSpan.FromDays(0)
                    };
                }
            });

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseMiddlewareExtensions();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp"; 
                spa.Options.DefaultPageStaticFileOptions = new StaticFileOptions()
                {
                    OnPrepareResponse = ctx => {
                        // Do not cache implicit `/index.html`.  See also: `UseSpaStaticFiles` above
                        var headers = ctx.Context.Response.GetTypedHeaders();
                        headers.CacheControl = new CacheControlHeaderValue
                        {
                            Public = true,
                            MaxAge = TimeSpan.FromDays(0)
                        };
                    }
                };
            });
            lifetime.ApplicationStarted.Register(() => OnApplicationStarted(app));

        }

        private void RegisterSwagger(IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.CustomSchemaIds(type => type.FullName);

                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Converge API", Version = "v1" });
                var filePath = Path.Combine(AppContext.BaseDirectory, "Converge.xml");
                if (File.Exists(filePath))
                {
                    c.IncludeXmlComments(filePath);
                }

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = @"JWT Authorization header using the Bearer scheme.<br/>
                                    Enter ""Bearer"" [space] and then your token in the text input below.<br/>
                                    For instance, ""Bearer ABC123DEF456..""",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement()
                        {
                            {
                                new OpenApiSecurityScheme
                                {
                                    Reference = new OpenApiReference
                                    {
                                        Type = ReferenceType.SecurityScheme,
                                        Id = "Bearer"
                                    },
                                    Scheme = "bearer",
                                    Name = "Bearer",
                                    In = ParameterLocation.Header
                                },
                                new List<string>()
                            }
                        });
                c.DescribeAllParametersInCamelCase();
            });
        }

        private void RegisterServices(IServiceCollection services)
        {
            services.AddScoped<UserGraphService>();
            services.AddScoped<ChatGraphService>();
            services.AddScoped<PlacesService>();
            services.AddScoped<ScheduleService>();
            services.AddScoped<RouteService>();
            services.AddScoped<SearchService>();
            services.AddSingleton<SearchBingMapsService>();
            services.AddScoped<SearchYelpApiService>();
            services.AddSingleton<AppGraphService>();
            services.AddSingleton<TelemetryService>();
            services.AddSingleton<PredictionService>();
            services.AddSingleton<PlacesMonoService>();
            services.AddSingleton<BuildingsMonoService>();
            services.AddSingleton<SyncService>();
            services.AddTransient<BuildingsService>();
            services.AddTransient<IHttpClientProviderService, HttpClientProviderService>();
            services.AddSingleton<CachePlacesProviderService>();
            services.AddSingleton<CacheSharePointContentService>();
        }

        private void RegisterValidators(IServiceCollection services)
        {
            services.AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<CampusesToCollaborateRequestValidator>());
        }

        /// <summary>
        /// Application initialization code to sync place data to SharePoint.
        /// </summary>
        public void OnApplicationStarted(IApplicationBuilder app)
        {
            // carry out the application initialization code
            using (var serviceScope = app.ApplicationServices.CreateScope())
            {
                if (!string.IsNullOrEmpty(Configuration["JobSchedules:SyncPlacesSchedule"]))
                {
                    if (Configuration["JobSchedules:SyncPlacesSchedule"] != "do not run")
                    {
                        var hostedServices = app.ApplicationServices.GetService<IEnumerable<IHostedService>>();
                        var placeSyncJob = hostedServices.FirstOrDefault(service => service.GetType() == typeof(PlaceSyncJob)) as PlaceSyncJob;
                        var asyncTask = Task.Run(async () =>
                        {
                            await placeSyncJob.DoWork(new System.Threading.CancellationToken(false)).ConfigureAwait(false);
                        });
                        asyncTask.Wait();
                    }
                }
            }
        }
    }
}
