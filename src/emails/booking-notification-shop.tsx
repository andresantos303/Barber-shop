import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components";

interface BookingNotificationShopEmailProps {
  serviceName: string;
  barberName: string;
  formattedDateTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
}

export default function BookingNotificationShopEmail({
  serviceName,
  barberName,
  formattedDateTime,
  customerName,
  customerPhone,
  customerEmail,
  notes,
}: BookingNotificationShopEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nova marcação: {customerName} — {serviceName}</Preview>
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif", padding: "32px 0" }}>
        <Container style={{ border: "1px solid #e5e5e5", borderRadius: "12px", padding: "32px", maxWidth: "480px" }}>
          <Heading style={{ fontSize: "18px", margin: "0 0 16px" }}>Nova Marcação</Heading>

          <Section style={{ backgroundColor: "#fafafa", borderRadius: "8px", padding: "16px", margin: "0 0 16px" }}>
            <Text style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 4px" }}>{serviceName}</Text>
            <Text style={{ fontSize: "14px", margin: "0 0 4px" }}>com {barberName}</Text>
            <Text style={{ fontSize: "14px", margin: 0 }}>{formattedDateTime}</Text>
          </Section>

          <Text style={{ fontSize: "14px", margin: "0 0 4px" }}>
            <strong>Cliente:</strong> {customerName}
          </Text>
          <Text style={{ fontSize: "14px", margin: "0 0 4px" }}>
            <strong>Telefone:</strong> {customerPhone}
          </Text>
          <Text style={{ fontSize: "14px", margin: "0 0 4px" }}>
            <strong>Email:</strong> {customerEmail}
          </Text>
          {notes && (
            <Text style={{ fontSize: "14px", margin: "8px 0 0" }}>
              <strong>Notas:</strong> {notes}
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
}
