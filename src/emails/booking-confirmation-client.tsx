import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface BookingConfirmationClientEmailProps {
  customerName: string;
  serviceName: string;
  barberName: string;
  formattedDateTime: string;
  address: string;
  cancelUrl: string;
}

export default function BookingConfirmationClientEmail({
  customerName,
  serviceName,
  barberName,
  formattedDateTime,
  address,
  cancelUrl,
}: BookingConfirmationClientEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>A sua marcação em André Cabeleireiro está confirmada</Preview>
      <Body style={{ backgroundColor: "#0b0a09", fontFamily: "Helvetica, Arial, sans-serif", padding: "32px 0" }}>
        <Container style={{ backgroundColor: "#161310", borderRadius: "12px", padding: "32px", maxWidth: "480px" }}>
          <Heading style={{ color: "#f3ede1", fontSize: "20px", margin: "0 0 16px" }}>
            Marcação Confirmada
          </Heading>
          <Text style={{ color: "#a39a89", fontSize: "14px", lineHeight: "22px" }}>
            Olá {customerName}, a sua marcação foi confirmada com sucesso:
          </Text>

          <Section style={{ backgroundColor: "#1d1a16", borderRadius: "8px", padding: "16px", margin: "16px 0" }}>
            <Text style={{ color: "#f3ede1", fontSize: "15px", fontWeight: 600, margin: "0 0 4px" }}>
              {serviceName}
            </Text>
            <Text style={{ color: "#a39a89", fontSize: "14px", margin: "0 0 4px" }}>com {barberName}</Text>
            <Text style={{ color: "#a39a89", fontSize: "14px", margin: 0 }}>{formattedDateTime}</Text>
          </Section>

          <Text style={{ color: "#a39a89", fontSize: "13px", lineHeight: "20px" }}>{address}</Text>

          <Hr style={{ borderColor: "#2a241d", margin: "24px 0" }} />

          <Text style={{ color: "#a39a89", fontSize: "13px" }}>
            Não pode comparecer? Cancele a sua marcação para libertar o horário para outro cliente.
          </Text>
          <Button
            href={cancelUrl}
            style={{
              backgroundColor: "transparent",
              border: "1px solid #b3433f",
              borderRadius: "6px",
              color: "#b3433f",
              fontSize: "13px",
              padding: "10px 20px",
            }}
          >
            Cancelar Marcação
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
