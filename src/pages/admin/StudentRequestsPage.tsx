import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { StudentRequests } from "@/components/admin/StudentRequests";

export default function StudentRequestsPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col lg:flex-row">
      <DashboardSidebar role="admin" />
      
      <main className="flex-1 p-4 lg:p-8">
        <div className="mb-4 lg:mb-6">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground">Demandes Élèves</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Gérez les demandes d'inscription des élèves
          </p>
        </div>
        
        <div className="bg-card rounded-xl shadow-card border border-border p-4 lg:p-6">
          <StudentRequests />
        </div>
      </main>
    </div>
  );
}
