"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export function CreateClassModal({ isOpen, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        className: "",
        section: "",
        subject: "",
        room: "",
    })

    const [errors, setErrors] = useState({})

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        if (field === "className" && errors.className) {
            setErrors((prev) => ({ ...prev, className: undefined }))
        }
    }

    const handleSubmit = () => {
        const newErrors = {}
        if (!formData.className.trim()) {
            newErrors.className = "Class name is required"
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        onSubmit(formData)
        setFormData({
            className: "",
            section: "",
            subject: "",
            room: "",
        })
        setErrors({})
        onClose()
    }

    const handleCancel = () => {
        setFormData({
            className: "",
            section: "",
            subject: "",
            room: "",
        })
        setErrors({})
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-normal text-gray-800">
                        Create class
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                id="className"

                                value={formData.className}
                                onChange={(e) => handleInputChange("className", e.target.value)}
                                className={`border-0 border-b-2 rounded-none px-0 pb-2 pt-4 text-base placeholder:text-blue-600 focus-visible:ring-0 ${errors.className
                                        ? "border-red-500 focus-visible:border-red-500"
                                        : "border-blue-600 focus-visible:border-blue-700"
                                    }`}
                            />
                            <Label
                                htmlFor="className"
                                className="absolute left-0 top-0 text-xs text-blue-600 font-medium"
                            >
                                Class name*
                            </Label>
                        </div>
                        {errors.className && (
                            <p className="text-xs text-red-500 mt-1">*Required</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                id="section"

                                value={formData.section}
                                onChange={(e) => handleInputChange("section", e.target.value)}
                                className="border-0 border-b border-gray-300 rounded-none px-0 pb-2 pt-4 text-base placeholder:text-gray-600 focus-visible:ring-0 focus-visible:border-blue-600"
                            />
                            <Label
                                htmlFor="section"
                                className="absolute left-0 top-0 text-xs text-gray-600"
                            >
                                Section
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                id="subject"

                                value={formData.subject}
                                onChange={(e) => handleInputChange("subject", e.target.value)}
                                className="border-0 border-b border-gray-300 rounded-none px-0 pb-2 pt-4 text-base placeholder:text-gray-600 focus-visible:ring-0 focus-visible:border-blue-600"
                            />
                            <Label
                                htmlFor="subject"
                                className="absolute left-0 top-0 text-xs text-gray-600"
                            >
                                Subject
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                id="room"
                                value={formData.room}
                                onChange={(e) => handleInputChange("room", e.target.value)}
                                className="border-0 border-b border-gray-300 rounded-none px-0 pb-2 pt-4 text-base placeholder:text-gray-600 focus-visible:ring-0 focus-visible:border-blue-600"
                            />
                            <Label
                                htmlFor="room"
                                className="absolute left-0 top-0 text-xs text-gray-600"
                            >
                                Room
                            </Label>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        onClick={handleCancel}
                        className="text-blue-600 hover:bg-blue-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Create
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}