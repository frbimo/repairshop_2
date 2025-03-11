"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"

export function LoginForm() {
    const router = useRouter()
    const { login } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async () => {
        if (!email) {
            setError("Please enter an email address")
            return
        }

        if (!password) {
            setError("Please enter a password")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const user = await login(email, password)
            if (user) {
                router.push("/customer")
                router.refresh()
            } else {
                setError("Invalid email or password")
            }
        } catch (err) {
            setError("Login failed. Please try again.")
            console.error("Login error:", err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Login to Stepha Autorepair</CardTitle>
                <CardDescription>Enter your credentials to access the system</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <div className="text-sm text-muted-foreground">
                        <p>Demo accounts:</p>
                        <ul className="list-disc list-inside">
                            <li>Admin: admin@example.com (password: admin123)</li>
                            <li>Officer: officer@example.com (password: admin123)</li>
                        </ul>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                        </>
                    ) : (
                        "Login"
                    )}
                </Button>
            </CardFooter>
        </Card>
    )
}

