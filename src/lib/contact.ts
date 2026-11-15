const configuredPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE;

if (!configuredPhone) {
  throw new Error("NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE is not configured.");
}

export const adminWhatsAppPhone = configuredPhone.replace(/\D/g, "");
export const adminWhatsAppUrl = `https://wa.me/${adminWhatsAppPhone}`;
export const adminPhoneDisplay = `+${adminWhatsAppPhone.slice(0, 2)} ${adminWhatsAppPhone.slice(2, 7)} ${adminWhatsAppPhone.slice(7)}`;
