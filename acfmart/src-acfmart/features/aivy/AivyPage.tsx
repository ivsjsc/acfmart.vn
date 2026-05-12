import { LogoSquare } from '../../components/Logo'
import { MessageCircle, Send } from 'lucide-react'

export default function AivyPage() {
  return (
    <div className="container-acf py-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-center">
          <div className="mr-4">
            <LogoSquare size="lg" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Aivy - Trợ lý AI của ACFMart</h1>
            <p className="text-neutral-600">Trợ lý AI hỗ trợ bạn 24/7 trên sàn thương mại điện tử chống hàng giả</p>
          </div>
        </div>
      </div>
    </div>
  )
}
