import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Tag, DollarSign, Sparkles } from "lucide-react"
import logo from "@/assets/logo.png"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CreateCoupon() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        code: "",
        description: "",
        discountType: "FLAT",
        discountValue: 0,
        maxDiscountAmount: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        usageLimitPerUser: 1,
        minCartValue: 0
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const payload = {
                code: formData.code.toUpperCase(),
                description: formData.description,
                discountType: formData.discountType,
                discountValue: Number(formData.discountValue),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                usageLimitPerUser: Number(formData.usageLimitPerUser),
                eligibility: {}
            }

            if (formData.discountType === "PERCENT" && formData.maxDiscountAmount > 0) {
                payload.maxDiscountAmount = Number(formData.maxDiscountAmount)
            }

            if (formData.minCartValue > 0) {
                payload.eligibility.minCartValue = Number(formData.minCartValue)
            }

            const res = await fetch("/api/coupons/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || data.details?.[0] || "Failed to create coupon")
            }

            navigate("/dashboard")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background font-sans text-foreground">
            <nav className="sticky top-0 z-50 border-b bg-white/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-3xl items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <div className="h-6 w-px bg-border"></div>
                    <img src={logo} alt="Logo" className="h-6 w-auto" />
                    <span className="text-lg font-semibold tracking-tight">Create New Coupon</span>
                </div>
            </nav>

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Launch a new <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">campaign</span>.
                    </h1>
                    <p className="mt-2 text-lg text-muted-foreground">
                        Configure the rules, discount, and validity for your new coupon.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                    {error && (
                        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                            <p className="font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4" /> Creation Failed
                            </p>
                            <p className="mt-1 opacity-90">{error}</p>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div className="border-b pb-2">
                            <h3 className="text-lg font-semibold">Basic Information</h3>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="code">Coupon Code</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    placeholder="e.g. SUMMER25"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                    className="font-mono uppercase tracking-wide"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder="e.g. Summer Sale Discount"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Discount Rules */}
                    <div className="space-y-6">
                        <div className="border-b pb-2">
                            <h3 className="text-lg font-semibold">Discount Configuration</h3>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="discountType">Discount Type</Label>
                                <div className="relative">
                                    <select
                                        id="discountType"
                                        name="discountType"
                                        className="flex h-10 w-full appearance-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                        value={formData.discountType}
                                        onChange={handleChange}
                                    >
                                        <option value="FLAT">Flat Amount (₹)</option>
                                        <option value="PERCENT">Percentage (%)</option>
                                    </select>
                                    <div className="pointer-events-none absolute right-3 top-2.5 text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discountValue">Value</Label>
                                <Input
                                    type="number"
                                    id="discountValue"
                                    name="discountValue"
                                    min="0"
                                    value={formData.discountValue}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {formData.discountType === "PERCENT" && (
                            <div className="rounded-lg bg-secondary/50 p-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxDiscountAmount">Max Discount Cap (Optional)</Label>
                                    <Input
                                        type="number"
                                        id="maxDiscountAmount"
                                        name="maxDiscountAmount"
                                        min="0"
                                        placeholder="Leave 0 for no limit"
                                        value={formData.maxDiscountAmount}
                                        onChange={handleChange}
                                    />
                                    <p className="text-[10px] text-muted-foreground">Maximum amount that can be discounted.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Validity & Limits */}
                    <div className="space-y-6">
                        <div className="border-b pb-2">
                            <h3 className="text-lg font-semibold">Validity & Limits</h3>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="minCartValue">Min Cart Value (₹)</Label>
                                <Input type="number" id="minCartValue" name="minCartValue" min="0" value={formData.minCartValue} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usageLimitPerUser">Usage Limit Per User</Label>
                                <Input type="number" id="usageLimitPerUser" name="usageLimitPerUser" min="1" value={formData.usageLimitPerUser} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button type="submit" className="w-full rounded-full" size="lg" disabled={loading}>
                            <Save className="mr-2 h-4 w-4" />
                            {loading ? "Creating Coupon..." : "Create Coupon"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}
