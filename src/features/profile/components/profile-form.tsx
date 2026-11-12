"use client";

import { useActionState, useRef, useState, type ComponentProps, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { saveProfileAction } from "@/features/profile/actions/profile-actions";
import { profileSchema, type ProfileInput } from "@/features/profile/schemas/profile";

const inputStyle = "mt-1.5 min-h-11 w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 aria-invalid:border-destructive";

type FieldProps = ComponentProps<"input"> & { label: string; error?: string };

function Field({ label, error, id, ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} className={inputStyle} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error ? <p className="mt-1 text-sm text-destructive" id={`${id}-error`}>{error}</p> : null}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

const markets: [ProfileInput["preferredMarkets"][number], string][] = [
  ["TECHNOLOGY", "Technology"], ["FINTECH", "Fintech"], ["HEALTHCARE", "Healthcare"],
  ["ECOMMERCE", "E-commerce"], ["EDUCATION", "Education"], ["MEDIA", "Media"],
  ["PROFESSIONAL_SERVICES", "Professional services"],
];

export function ProfileForm({ initialValues, email, availableSkills }: {
  initialValues: ProfileInput;
  email: string;
  availableSkills: { id: string; name: string }[];
}) {
  const [values, setValues] = useState(initialValues);
  const [skillSearch, setSkillSearch] = useState("");
  const [clientErrors, setClientErrors] = useState<Record<string, string[] | undefined>>({});
  const [state, formAction, pending] = useActionState(saveProfileAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const fieldErrors = Object.keys(clientErrors).length ? clientErrors : state && !state.ok ? state.fieldErrors ?? {} : {};
  const error = (field: string) => fieldErrors[field]?.[0];

  function update<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setClientErrors({});
  }

  function toggle<T extends string>(current: T[], value: T) {
    return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5" onSubmit={(event) => {
      const result = profileSchema.safeParse(values);
      if (!result.success) {
        event.preventDefault();
        const errors = result.error.flatten().fieldErrors;
        setClientErrors(errors);
        const firstField = Object.keys(errors)[0];
        const element = formRef.current?.elements.namedItem(firstField);
        if (element instanceof HTMLElement) element.focus();
      }
    }}>
      <fieldset className="space-y-5" disabled={pending}>
        <Section title="Personal details" description="How employers can identify and contact you.">
          <Field id="profile-name" name="name" label="Full name" autoComplete="name" required maxLength={100} value={values.name} onChange={(event) => update("name", event.target.value)} error={error("name")} />
          <Field id="profile-email" label="Email" type="email" value={email} readOnly aria-describedby="email-help" />
          <Field id="profile-phone" name="phone" label="Phone" type="tel" autoComplete="tel" maxLength={30} value={values.phone} onChange={(event) => update("phone", event.target.value)} error={error("phone")} />
          <Field id="profile-location" name="location" label="City / location" autoComplete="address-level2" maxLength={100} value={values.location} onChange={(event) => update("location", event.target.value)} error={error("location")} />
          <Field id="profile-country" name="country" label="Country" autoComplete="country-name" maxLength={80} value={values.country} onChange={(event) => update("country", event.target.value)} error={error("country")} />
          <div>
            <Field id="profile-timezone" name="timeZone" label="Time zone" placeholder="Asia/Kolkata" list="timezones" maxLength={80} value={values.timeZone} onChange={(event) => update("timeZone", event.target.value)} error={error("timeZone")} />
            <datalist id="timezones">{["Asia/Kolkata", "Europe/London", "Europe/Berlin", "America/New_York", "America/Los_Angeles", "Asia/Singapore", "Australia/Sydney", "UTC"].map((zone) => <option key={zone} value={zone} />)}</datalist>
          </div>
          <p id="email-help" className="text-xs text-muted-foreground sm:col-span-2">Your email is linked to your login and cannot be changed here.</p>
        </Section>
        <Section title="Professional profile" description="Add your experience and the work you do.">
          <div className="sm:col-span-2"><Field id="profile-headline" name="headline" label="Headline" placeholder="Frontend developer · React and TypeScript" maxLength={120} value={values.headline} onChange={(event) => update("headline", event.target.value)} error={error("headline")} /></div>
          <Field id="profile-years" name="yearsExperience" label="Years of experience" type="number" min={0} max={60} step={1} value={values.yearsExperience} onChange={(event) => update("yearsExperience", Number(event.target.value))} error={error("yearsExperience")} />
          <div>
            <label htmlFor="profile-level" className="text-sm font-medium">Experience level</label>
            <select id="profile-level" name="experienceLevel" className={inputStyle} value={values.experienceLevel} onChange={(event) => update("experienceLevel", profileSchema.shape.experienceLevel.parse(event.target.value))}>
              <option value="ENTRY">Entry level</option><option value="MID">Mid level</option><option value="SENIOR">Senior</option><option value="LEAD">Lead</option><option value="EXECUTIVE">Executive</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="profile-bio" className="text-sm font-medium">Short bio</label>
            <textarea id="profile-bio" name="bio" rows={4} maxLength={2000} className={inputStyle} value={values.bio} onChange={(event) => update("bio", event.target.value)} aria-invalid={Boolean(error("bio"))} />
            <p className="mt-1 text-xs text-muted-foreground">{values.bio.length}/2000 characters</p>
          </div>
        </Section>
        <Section title="Skills" description="Choose up to 30 skills. These help match your profile with jobs.">
          <div className="sm:col-span-2">
            <Field id="skill-search" label="Find a skill" type="search" placeholder="Search skills" value={skillSearch} onChange={(event) => setSkillSearch(event.target.value)} />
            <p className="mt-3 text-sm text-muted-foreground">{values.skillIds.length} selected</p>
            {values.skillIds.map((id) => <input key={id} type="hidden" name="skillIds" value={id} />)}
            <div className="mt-3 flex max-h-56 flex-wrap gap-2 overflow-y-auto p-1" role="group" aria-label="Skills">
              {availableSkills.filter((skill) => skill.name.toLowerCase().includes(skillSearch.trim().toLowerCase())).map((skill) => (
                <label key={skill.id} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-ring">
                  <input className="accent-primary" type="checkbox" checked={values.skillIds.includes(skill.id)} disabled={!values.skillIds.includes(skill.id) && values.skillIds.length >= 30} onChange={() => update("skillIds", toggle(values.skillIds, skill.id))} />
                  {skill.name}
                </label>
              ))}
            </div>
            {!availableSkills.some((skill) => skill.name.toLowerCase().includes(skillSearch.trim().toLowerCase())) ? <p className="mt-3 text-sm text-muted-foreground">No skills match your search.</p> : null}
            {error("skillIds") ? <p role="alert" className="mt-2 text-sm text-destructive">{error("skillIds")}</p> : null}
          </div>
        </Section>
        <Section title="Job preferences" description="Tell us which markets and work arrangements interest you.">
          <fieldset><legend className="text-sm font-medium">Work arrangement</legend><div className="mt-3 space-y-3">
            {([["REMOTE", "Remote"], ["HYBRID", "Hybrid"], ["ON_SITE", "On site"]] as const).map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="checkbox" name="preferredWorkplaceTypes" value={value} checked={values.preferredWorkplaceTypes.includes(value)} onChange={() => update("preferredWorkplaceTypes", toggle(values.preferredWorkplaceTypes, value))} className="size-4 accent-primary" />{label}</label>)}
          </div></fieldset>
          <fieldset><legend className="text-sm font-medium">Markets</legend><div className="mt-3 space-y-3">
            {markets.map(([value, label]) => <label key={value} className="flex items-center gap-2 text-sm"><input type="checkbox" name="preferredMarkets" value={value} checked={values.preferredMarkets.includes(value)} onChange={() => update("preferredMarkets", toggle(values.preferredMarkets, value))} className="size-4 accent-primary" />{label}</label>)}
          </div></fieldset>
        </Section>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5">
        <p role="status" className={state && !state.ok ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
          {Object.keys(clientErrors).length ? "Check the highlighted fields." : state?.ok ? state.data.message : state?.error ?? "Save your changes before leaving this page."}
        </p>
        <Button type="submit" disabled={pending} size="lg">{pending ? "Saving…" : "Save profile"}</Button>
      </div>
    </form>
  );
}
