const configuredPhone = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_PHONE;

export const adminWhatsAppPhone = configuredPhone?.replace(/\D/g, "") ?? "";
export const adminWhatsAppUrl = `https://wa.me/${adminWhatsAppPhone}`;
export const adminPhoneDisplay = adminWhatsAppPhone
  ? `+${adminWhatsAppPhone.slice(0, 2)} ${adminWhatsAppPhone.slice(2, 7)} ${adminWhatsAppPhone.slice(7)}`
  : "Contact support";
