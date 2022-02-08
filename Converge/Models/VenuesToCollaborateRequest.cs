// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Converge.Helpers;
using FluentValidation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Converge.Models
{
    public class VenuesToCollaborateRequest
    {
        [Required]
        public List<string> TeamMembers { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        public string VenueType { get; set; }

        public string Keywords { get; set; }

        public string CloseToUser { get; set; }
        
        /// <summary>
        /// The number of records to skip before returning.
        /// </summary>
        public int? Skip { get; set; }

        /// <summary>
        /// The number of records to return.
        /// </summary>
        public int? Limit { get; set; }
    }

    public class VenuesToCollaborateRequestValidator : AbstractValidator<VenuesToCollaborateRequest>
    {
        public VenuesToCollaborateRequestValidator()
        {
            var errorBuilder = new StringBuilder();

            errorBuilder = errorBuilder.Clear().Append("Start-time should be later than now.");
            RuleFor(req => req.StartTime).GreaterThan(DateTime.UtcNow.Date).WithMessage(errorBuilder.ToString());
            errorBuilder = errorBuilder.Clear().Append("Start-time should be earlier than End-time.");
            RuleFor(req => req.StartTime).LessThan(x => x.EndTime).WithMessage(errorBuilder.ToString());

            errorBuilder = errorBuilder.Clear().Append("Provide either Venue-type or Keywords.");
            RuleFor(req => req.Keywords).NotEmpty().When(t => string.IsNullOrWhiteSpace(t.VenueType)).WithMessage(errorBuilder.ToString());
            RuleFor(req => req.VenueType).NotEmpty().When(t => string.IsNullOrWhiteSpace(t.Keywords)).WithMessage(errorBuilder.ToString());

            errorBuilder = errorBuilder.Clear().Append("Inputs for Venue-type can be one among: ")
                                                .AppendJoin(", ", Constant.AcceptableVenueTypes).Append(".");
            RuleFor(req => req.VenueType).Must(x => x.OneAmong(Constant.AcceptableVenueTypes)).When(t => !string.IsNullOrWhiteSpace(t.VenueType))
                                            .WithMessage(errorBuilder.ToString());

            errorBuilder = errorBuilder.Clear().Append("CloseToUser '{0}' should be one among the Team-members.");
            RuleFor(req => req).Must(x => x.CloseToUser.OneAmong(x.TeamMembers)).When(t => !string.IsNullOrWhiteSpace(t.CloseToUser))
                                                        .WithMessage(y => string.Format(errorBuilder.ToString(), y.CloseToUser));
        }
    }
}
