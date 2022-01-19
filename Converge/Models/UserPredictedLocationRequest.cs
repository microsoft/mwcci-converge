// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using FluentValidation;
using System;
using System.Text;

namespace Converge.Models
{
    public class UserPredictedLocationRequest
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int Day { get; set; }

        public UserPredictedLocation UserPredictedLocation { get; set; }
    }

    public class UserPredictedLocationRequestValidator : AbstractValidator<UserPredictedLocationRequest>
    {
        public UserPredictedLocationRequestValidator()
        {
            var errorBuilder = new StringBuilder();

            errorBuilder = errorBuilder.Clear().Append("Date cannot be in the past.");
            RuleFor(req => req).Must(x => new DateTime(x.Year, x.Month, x.Day).CompareTo(DateTime.Today.AddDays(-1)) > 0)
                                .WithMessage(errorBuilder.ToString());

            errorBuilder = errorBuilder.Clear().Append("Provide either Campus-upn or Other-Location-Option.");
            RuleFor(req => req.UserPredictedLocation.CampusUpn).NotEmpty()
                                                        .When(p => string.IsNullOrWhiteSpace(p.UserPredictedLocation.OtherLocationOption))
                                                        .WithMessage(errorBuilder.ToString());
            RuleFor(req => req.UserPredictedLocation.OtherLocationOption).NotEmpty()
                                                        .When(p => string.IsNullOrWhiteSpace(p.UserPredictedLocation.CampusUpn))
                                                        .WithMessage(errorBuilder.ToString());
            RuleFor(req => req.UserPredictedLocation).Must(x => string.IsNullOrEmpty(x.OtherLocationOption))
                                                        .When(p => !string.IsNullOrWhiteSpace(p.UserPredictedLocation.CampusUpn))
                                                        .WithMessage(errorBuilder.ToString());

            errorBuilder = errorBuilder.Clear().Append("Inputs for OtherLocationOption can be one among case-sensitively: ")
                                                .AppendJoin(", ", Constant.OtherLocationType).Append(".");
            RuleFor(req => req.UserPredictedLocation).Must(x => x.OtherLocationOption.OneAmong(Constant.OtherLocationType, false))
                                                        .When(p => !string.IsNullOrWhiteSpace(p.UserPredictedLocation.OtherLocationOption))
                                                        .WithMessage(errorBuilder.ToString());
        }
    }
}
