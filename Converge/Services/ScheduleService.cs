// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using Converge.Models;
using Microsoft.Graph;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Converge.Services
{
    public class ScheduleService
    {
        private readonly AppGraphService appGraphService;

        public ScheduleService(AppGraphService appGraphService)
        {
            this.appGraphService = appGraphService;
        }

        public async Task<double> GetReserved(string start, string end, ExchangePlace workspace)
        {
            List <Event> events = await appGraphService.GetAllEvents(
                workspace.Identity,
                start,
                end
            );
            double reserved = TimeHelper.GetAverageReserved(DateTime.Parse(start).ToUniversalTime(), DateTime.Parse(end).ToUniversalTime(), events);
            return (workspace.Capacity == 0) ? 0 : reserved / workspace.Capacity * 100;
        }

        public async Task<int> GetMaxReserved(string start, string end, string id)
        {
            List<Event> events = await appGraphService.GetAllEvents(
                id,
                start,
                end
            );
            int reserved = TimeHelper.GetMaxReserved(DateTime.Parse(start), DateTime.Parse(end), events);
            return reserved;
        }

        public async Task<int> GetMaxReserved(DateTime localStartTime, DateTime localEndTime, string id)
        {
            return await GetMaxReserved(localStartTime.ToString(), localEndTime.ToString(), id);
        }

        public async Task<bool> GetAvailability(string start, string end, string upn)
        {
            ScheduleInformation schedule = await appGraphService.GetSchedule(upn, start, end);
            foreach (char character in schedule.AvailabilityView)
            {
                if (character != '0')
                {
                    return false;
                }
            }
            return true;
        }

        public async Task<bool> GetAvailability(DateTime utcStartTime, DateTime utcEndTime, string id)
        {
            return await GetAvailability(utcStartTime.ToString(), utcEndTime.ToString(), id);
        }
    }
}
