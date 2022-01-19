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
    public class CampusesToCollaborateRequest
    {
        [Required]
        public List<string> TeamMembers { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        public string CapacitySortOrder { get; set; } = Constant.SortOrder[1];

        [Required]
        public string PlaceType { get; set; }

        public string CloseToUser { get; set; }

        [Required]
        public double DistanceFromSource { get; set; }
    }

    public class CampusesToCollaborateRequestValidator : AbstractValidator<CampusesToCollaborateRequest>
    {
        public CampusesToCollaborateRequestValidator()
        {
            var errorBuilder = new StringBuilder();

            errorBuilder = errorBuilder.Clear().Append("Start-time should be later than now.");
            RuleFor(req => req.StartTime).GreaterThan(DateTime.UtcNow.Date).WithMessage(errorBuilder.ToString());
            errorBuilder = errorBuilder.Clear().Append("Start-time should be earlier than End-time.");
            RuleFor(req => req.StartTime).LessThan(x => x.EndTime).WithMessage(errorBuilder.ToString());

            errorBuilder = errorBuilder.Clear().Append("Inputs for Capacity-sort-order can be one among: ")
                                                .AppendJoin(", ", Constant.SortOrder).Append(".");
            RuleFor(request => request.CapacitySortOrder).Must(x => x.OneAmong(Constant.SortOrder)).WithMessage(errorBuilder.ToString());

            errorBuilder = errorBuilder.Clear().Append("Inputs for Distance-from-source should be zero or more.");
            RuleFor(request => request.DistanceFromSource).Must(x => x >= 0).WithMessage(errorBuilder.ToString());

            errorBuilder = errorBuilder.Clear().Append("Inputs for Place-type can be one among: ")
                                                .AppendJoin(", ", Enum.GetNames(typeof(PlaceType))).Append(".");
            RuleFor(req => req.PlaceType).Must(x => x.OneAmong(Enum.GetNames(typeof(PlaceType)))).WithMessage(errorBuilder.ToString());

            errorBuilder = errorBuilder.Clear().Append("CloseToUser '{0}' should be one among the Team-members.");
            RuleFor(req => req).Must(x => x.CloseToUser.OneAmong(x.TeamMembers)).When(t => !string.IsNullOrWhiteSpace(t.CloseToUser))
                                                        .WithMessage(y => string.Format(errorBuilder.ToString(), y.CloseToUser));
        }
    }
}
