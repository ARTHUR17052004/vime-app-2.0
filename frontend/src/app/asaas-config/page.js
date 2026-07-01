import AsaasWizard from "../components/asaas/AsaasWizard";
import AsaasStatusCard from "../components/asaas/AsaasStatusCard";
import AsaasConfiguracaoForm from "../components/asaas/AsaasConfiguracaoForm";
import AsaasWebhookCard from "../components/asaas/AsaasWebhookCard";
import AsaasDiagnostico from "../components/asaas/AsaasDiagnostico";
import AsaasTutorial from "../components/asaas/AsaasTutorial";

export default function AsaasConfigPage() {
  return (
    <div className="space-y-6">
      <AsaasWizard />

      <AsaasStatusCard />

      <AsaasConfiguracaoForm />

      <AsaasWebhookCard />

      <AsaasDiagnostico />

      <AsaasTutorial />
    </div>
  );
}