"""
Financial Projection Model for E-commerce Platform (Vietnam 2026 Context)
Based on provided investment thesis:
- Core Team: 25-30 people
- Infrastructure: Viettel/VNPT Cloud
- Marketing: TikTok/Affiliate focus
"""

class FinancialModel:
    def __init__(self, scenario='base'):
        self.scenario = scenario
        self.months = 12
        
        # Define ranges based on user input
        self.costs = {
            'conservative': {
                'personnel_monthly': 650_000_000,      # 650 triệu
                'infra_monthly': 375_000_000,          # 375 triệu
                'marketing_total': 3_000_000_000,      # 3 tỷ
                'legal_one_time': 285_000_000,         # 285 triệu
                'contingency_total': 1_500_000_000     # 1.5 tỷ
            },
            'base': {
                'personnel_monthly': 800_000_000,      # Mid-range estimate
                'infra_monthly': 500_000_000,          # Mid-range estimate
                'marketing_total': 4_000_000_000,      # 4 tỷ
                'legal_one_time': 500_000_000,         # Mid-range estimate
                'contingency_total': 2_000_000_000     # 2 tỷ
            },
            'aggressive': {
                'personnel_monthly': 950_000_000,      # 950 triệu
                'infra_monthly': 620_000_000,          # 620 triệu
                'marketing_total': 5_000_000_000,      # 5 tỷ
                'legal_one_time': 720_000_000,         # 720 triệu
                'contingency_total': 2_500_000_000     # 2.5 tỷ
            }
        }
        
        # Capital Structure Constants
        self.acf_cash_contribution = 6_000_000_000 # 6 tỷ tiền mặt
        
    def calculate_runway(self):
        data = self.costs[self.scenario]
        
        # Calculate OpEx
        total_personnel = data['personnel_monthly'] * self.months
        total_infra = data['infra_monthly'] * self.months
        total_marketing = data['marketing_total']
        total_legal = data['legal_one_time']
        total_contingency = data['contingency_total']
        
        grand_total = total_personnel + total_infra + total_marketing + total_legal + total_contingency
        
        # IVS Contribution (In-kind/Tech)
        ivs_contribution = grand_total - self.acf_cash_contribution
        
        return {
            'scenario': self.scenario,
            'total_capital_needed': grand_total,
            'acf_cash_required': self.acf_cash_contribution,
            'ivs_tech_equity_value': ivs_contribution,
            'breakdown': {
                'personnel_12m': total_personnel,
                'infra_12m': total_infra,
                'marketing_total': total_marketing,
                'legal_total': total_legal,
                'contingency': total_contingency
            }
        }

    def print_report(self):
        result = self.calculate_runway()
        print(f"--- KẾ HOẠCH TÀI CHÍNH: {result['scenario'].upper()} ---")
        print(f"Tổng vốn cần huy động: {result['total_capital_needed']/1e9:.2f} Tỷ VNĐ")
        print(f"   ├── ACF (Tiền mặt): {result['acf_cash_required']/1e9:.2f} Tỷ VNĐ")
        print(f"   └── IVS (Công nghệ/Nhân sự): {result['ivs_tech_equity_value']/1e9:.2f} Tỷ VNĐ")
        print("\nChi tiết chi phí 12 tháng:")
        for k, v in result['breakdown'].items():
            print(f"   • {k.replace('_', ' ').title()}: {v/1e9:.2f} Tỷ VNĐ")
        print("-" * 40)

# Execute Scenarios
if __name__ == "__main__":
    models = [FinancialModel('conservative'), FinancialModel('base'), FinancialModel('aggressive')]
    for model in models:
        model.print_report()
