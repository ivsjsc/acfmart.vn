"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const shipping_providers_1 = require("../../../../../lib/shipping-providers");
const GET = async (req, res) => {
    try {
        const providerId = req.query.providerId;
        const trackingNumber = req.params.trackingNumber;
        const tracking = await (0, shipping_providers_1.trackShippingProviderOrder)(providerId, trackingNumber);
        res.status(200).json({ success: true, tracking });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            error: error instanceof Error ? error.message : "Tracking is unavailable",
        });
    }
};
exports.GET = GET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3NoaXBwaW5nL3RyYWNrL1t0cmFja2luZ051bWJlcl0vcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsOEVBQWtGO0FBRzNFLE1BQU0sR0FBRyxHQUFHLEtBQUssRUFBRSxHQUFrQixFQUFFLEdBQW1CLEVBQUUsRUFBRTtJQUNuRSxJQUFJLENBQUM7UUFDSCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFVBQWdDLENBQUE7UUFDN0QsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUE7UUFFaEQsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLCtDQUEwQixFQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQTtRQUM3RSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQTtJQUNuRCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQ25CLE9BQU8sRUFBRSxLQUFLO1lBQ2QsS0FBSyxFQUFFLEtBQUssWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHlCQUF5QjtTQUMxRSxDQUFDLENBQUE7SUFDSixDQUFDO0FBQ0gsQ0FBQyxDQUFBO0FBYlksUUFBQSxHQUFHLE9BYWYifQ==