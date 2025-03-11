// QR code generation utility functions
export function generateRandomId(prefix: string): string {
    const timestamp = new Date().getTime().toString().slice(-6)
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")
    return `${prefix}-${timestamp}-${random}`
}

export function getQRCodeUrl(id: string): string {
    // This uses the QR code API to generate a QR code image URL
    // We encode the ID in the QR code
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(id)}`
}

