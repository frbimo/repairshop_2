import { Loader2 } from "lucide-react"
import { PageContainer } from "@/components/page-container"
import { PageHeader } from "@/components/page-header"

export default function Loading() {
    return (
        <PageContainer>
            <PageHeader title="Invoices" />
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading invoices...</p>
                </div>
            </div>
        </PageContainer>
    )
}

