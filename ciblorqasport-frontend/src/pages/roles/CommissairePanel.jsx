import CommissaireRequests from "./CommissaireRequests";
import CommissaireWithdrawalRequests from "./CommissaireWithdrawalRequests";

export default function CommissairePanel() {
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-xl font-bold">Panel Commissaire</h3>

      <CommissaireRequests onlyPending={false} />
      
      <div className="pt-6 border-t border-slate-200">
        <CommissaireWithdrawalRequests />
      </div>
    </div>
  );
}
