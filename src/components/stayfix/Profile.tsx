import { useStayFix } from "@/lib/stayfix/store";
import { ROLE_LABEL } from "./AppShell";
import { PageHeader } from "./ui";

export function Profile() {
  const { me, resetDemo } = useStayFix();
  return (
    <div>
      <PageHeader title="Mi perfil" subtitle={ROLE_LABEL[me.role]} />
      <div className="panel max-w-xl divide-y">
        {[
          ["Nombre completo", me.name],
          ["Correo electrónico", me.email],
          ["Teléfono principal", me.phone],
          ["Teléfonos adicionales", me.extraPhones.join(", ") || "—"],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[11rem_1fr] gap-4 px-5 py-3.5 text-sm">
            <span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-outline mt-6" onClick={resetDemo}>Restablecer datos de demostración</button>
    </div>
  );
}
