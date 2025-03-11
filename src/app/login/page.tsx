import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-center min-h-[80vh]">
                <LoginForm />
            </div>
        </div>
    )
}

