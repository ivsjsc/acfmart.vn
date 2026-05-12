"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const env_1 = require("../../../lib/env");
const GET = async (_req, res) => {
    res.status(200).json({
        providers: [
            {
                id: "vnpay",
                configured: (0, env_1.hasEnv)("VNPAY_TMN_CODE") &&
                    (0, env_1.hasEnv)("VNPAY_HASH_SECRET"),
            },
            {
                id: "momo",
                configured: (0, env_1.hasEnv)("MOMO_PARTNER_CODE") &&
                    (0, env_1.hasEnv)("MOMO_ACCESS_KEY") &&
                    (0, env_1.hasEnv)("MOMO_SECRET_KEY"),
            },
            {
                id: "zalopay",
                configured: (0, env_1.hasEnv)("ZALOPAY_APP_ID") &&
                    (0, env_1.hasEnv)("ZALOPAY_KEY1") &&
                    (0, env_1.hasEnv)("ZALOPAY_KEY2"),
            },
        ],
    });
};
exports.GET = GET;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL2FkbWluL3BheW1lbnQvcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsMENBQXlDO0FBRWxDLE1BQU0sR0FBRyxHQUFHLEtBQUssRUFBRSxJQUFtQixFQUFFLEdBQW1CLEVBQUUsRUFBRTtJQUNwRSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNuQixTQUFTLEVBQUU7WUFDVDtnQkFDRSxFQUFFLEVBQUUsT0FBTztnQkFDWCxVQUFVLEVBQ1IsSUFBQSxZQUFNLEVBQUMsZ0JBQWdCLENBQUM7b0JBQ3hCLElBQUEsWUFBTSxFQUFDLG1CQUFtQixDQUFDO2FBQzlCO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLE1BQU07Z0JBQ1YsVUFBVSxFQUNSLElBQUEsWUFBTSxFQUFDLG1CQUFtQixDQUFDO29CQUMzQixJQUFBLFlBQU0sRUFBQyxpQkFBaUIsQ0FBQztvQkFDekIsSUFBQSxZQUFNLEVBQUMsaUJBQWlCLENBQUM7YUFDNUI7WUFDRDtnQkFDRSxFQUFFLEVBQUUsU0FBUztnQkFDYixVQUFVLEVBQ1IsSUFBQSxZQUFNLEVBQUMsZ0JBQWdCLENBQUM7b0JBQ3hCLElBQUEsWUFBTSxFQUFDLGNBQWMsQ0FBQztvQkFDdEIsSUFBQSxZQUFNLEVBQUMsY0FBYyxDQUFDO2FBQ3pCO1NBQ0Y7S0FDRixDQUFDLENBQUE7QUFDSixDQUFDLENBQUE7QUF6QlksUUFBQSxHQUFHLE9BeUJmIn0=