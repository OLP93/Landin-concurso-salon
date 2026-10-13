import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inscribir, storage } from "@/lib/storage";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre (mínimo 2 caracteres).").max(80, "El nombre es demasiado largo."),
  correo: z.string().trim().max(254, "El correo es demasiado largo.").email("Introduce un correo electrónico válido."),
  telefono: z
    .string()
    .trim()
    .max(20, "El teléfono es demasiado largo.")
    .regex(/^[+\d\s().-]*$/, "El teléfono solo puede contener números, espacios y +.")
    .optional()
    .or(z.literal("")),
  aceptaBases: z.literal(true, { errorMap: () => ({ message: "Debes aceptar las bases legales y la política de privacidad para participar." }) }),
  aceptaComunicaciones: z.boolean(),
});
type FormValues = z.input<typeof schema>;

export function SignupForm({ disabled }: { disabled: boolean }) {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: "", correo: "", telefono: "", aceptaBases: false as unknown as true, aceptaComunicaciones: false },
  });

  const onSubmit = async (v: FormValues) => {
    setServerError(null);
    const r = inscribir({ ...v, aceptaBases: v.aceptaBases === true, aceptaComunicaciones: v.aceptaComunicaciones === true });
    if (!r.ok) {
      setServerError(
        r.error === "duplicado"
          ? "Este correo ya está inscrito en el concurso. Cada correo solo puede participar una vez."
          : r.error === "cerrado"
            ? "Las inscripciones están cerradas en este momento."
            : "Debes aceptar las bases legales.",
      );
      return;
    }
    const enlace = `${window.location.origin}/confirmar/${r.participante.tokenConfirmacion}`;
    await sendEmail(storage.getPlantillas().confirmacion, r.participante.correo, { nombre: r.participante.nombre, enlace_confirmacion: enlace });
    navigate({ to: "/pendiente", search: { t: r.participante.tokenConfirmacion } });
  };

  const err = (id: string, msg?: string) =>
    msg ? <p id={id} className="mt-1 text-sm text-destructive" role="alert">{msg}</p> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4" aria-label="Formulario de inscripción">
      <fieldset disabled={disabled || isSubmitting} className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" autoComplete="name" className="mt-1 h-11" aria-invalid={!!errors.nombre} aria-describedby={errors.nombre ? "e-nombre" : undefined} {...register("nombre")} />
          {err("e-nombre", errors.nombre?.message)}
        </div>
        <div>
          <Label htmlFor="correo">Correo electrónico</Label>
          <Input id="correo" type="email" inputMode="email" autoComplete="email" className="mt-1 h-11" aria-invalid={!!errors.correo} aria-describedby={errors.correo ? "e-correo" : undefined} {...register("correo")} />
          {err("e-correo", errors.correo?.message)}
        </div>
        <div>
          <Label htmlFor="telefono">Teléfono (opcional)</Label>
          <Input id="telefono" type="tel" autoComplete="tel" className="mt-1 h-11" aria-invalid={!!errors.telefono} aria-describedby={errors.telefono ? "e-tel" : undefined} {...register("telefono")} />
          {err("e-tel", errors.telefono?.message)}
        </div>
        <div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-primary" aria-invalid={!!errors.aceptaBases} aria-describedby={errors.aceptaBases ? "e-bases" : undefined} {...register("aceptaBases")} />
            <span>
              He leído y acepto las <Link to="/bases-legales" target="_blank" className="text-primary underline underline-offset-4">bases legales</Link> y la{" "}
              <Link to="/privacidad" target="_blank" className="text-primary underline underline-offset-4">política de privacidad</Link>. <span className="text-destructive" aria-hidden="true">*</span>
            </span>
          </label>
          {err("e-bases", errors.aceptaBases?.message)}
        </div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-primary" {...register("aceptaComunicaciones")} />
          <span>Acepto recibir comunicaciones del salón <span className="text-muted-foreground">(opcional, no influye en el concurso)</span>.</span>
        </label>
        {serverError && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive" role="alert">{serverError}</p>}
        <Button type="submit" size="lg" className="h-12 w-full rounded-full text-base shadow-soft">
          {isSubmitting ? "Enviando…" : "Participar"}
        </Button>
      </fieldset>
    </form>
  );
}
