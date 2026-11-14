"use client";

import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { generateProfileAiAction, prepareProfileAiAction, saveProfileAiAction } from "@/features/profile/actions/profile-ai-actions";
import { aiDraftSchema, type AiPreparation, type AiSuggestion } from "@/features/profile/schemas/profile-ai";

type JobChoice = { id: string; title: string; company: { name: string } };
const inputClass = "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary";

export function ProfileAiModal({ jobs, jobId }: { jobs?: JobChoice[]; jobId?: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(jobId ?? jobs?.[0]?.id ?? "");
  const [prepared, setPrepared] = useState<AiPreparation | null>(null);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [suggestion, setSuggestion] = useState<AiSuggestion | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function prepare() {
    setError("");
    startTransition(async () => {
      try {
        const result = await prepareProfileAiAction({ jobId: selectedJob });
        if (result.ok) { setPrepared(result.data); setAnswers({}); setSuggestion(null); }
        else setError(result.error);
      } catch { setError("We could not load your profile. Please try again."); }
    });
  }

  function request() {
    if (!prepared) return null;
    return { jobId: selectedJob, revision: prepared.revision,
      answers: prepared.missingSkills.filter(({ id }) => id in answers).map(({ id }) => ({ skillId: id, known: answers[id] === true })),
    };
  }

  return <>
    <Button className="text-sm" type="button" variant="outline" disabled={!jobId && !jobs?.length} onClick={() => {
      setOpen(true); setPrepared(null); setAnswers({}); setSuggestion(null); setSaved(false); setError("");
    }}>Improve profile with AI</Button>
    <Modal open={open} onClose={() => { if (!pending) setOpen(false); }} title={saved ? "Profile updated" : suggestion ? "Review your profile draft" : prepared ? "Which skills do you know?" : "Tailor your profile"}
      description={saved ? "Your next application will use your updated profile. Existing applications keep their original score and resume." : "Confirm your skills, review the draft, then choose whether to save it."}>
      {saved ? <div className="space-y-4"><p role="status" className="text-sm text-primary">Your headline, bio and confirmed skills are saved.</p><Button className="w-full" type="button" onClick={() => setOpen(false)}>Done</Button></div> : !prepared ? <div className="space-y-4">
        {jobs ? <div><label className="text-sm font-medium" htmlFor={`${id}-job`}>Preferred job</label><select id={`${id}-job`} name="preferredJob" autoComplete="off" className={inputClass} value={selectedJob} disabled={pending} onChange={(event) => setSelectedJob(event.target.value)}>
          {jobs.map((job) => <option value={job.id} key={job.id}>{job.title} · {job.company.name}</option>)}
        </select></div> : null}
        <p className="text-sm leading-6 text-muted-foreground">We use your saved profile. Save any manual changes first. Groq receives your headline, bio, experience and confirmed skills to draft suggestions.</p>
        <Button className="w-full" type="button" disabled={pending || !selectedJob} onClick={prepare}>{pending ? "Loading profile…" : "Check my skills"}</Button>
      </div> : <form className="space-y-4" onSubmit={(event) => {
        event.preventDefault(); setError("");
        const input = request();
        if (!input) return;
        if (!suggestion && input.answers.length !== prepared.missingSkills.length) { setError("Answer Yes or No for each skill."); return; }
        if (suggestion && !aiDraftSchema.safeParse({ headline: suggestion.headline, bio: suggestion.bio }).success) { setError("Use a headline of 2–120 characters and a bio of 10–2000 characters."); return; }
        startTransition(async () => {
          try {
            if (suggestion) {
              const result = await saveProfileAiAction({ ...input, headline: suggestion.headline, bio: suggestion.bio });
              if (result.ok) setSaved(true); else setError(result.error);
            } else {
              const result = await generateProfileAiAction(input);
              if (result.ok) setSuggestion(result.data); else setError(result.error);
            }
          } catch { setError("We could not complete that request. Please try again."); }
        });
      }}>
        <p className="break-words text-sm font-semibold">{prepared.jobTitle}</p>
        {suggestion ? <>
          <details className="rounded-lg bg-secondary/40 p-3 text-sm"><summary className="cursor-pointer font-medium">Your current profile</summary><p className="mt-2 break-words">{prepared.currentHeadline || "No headline yet."}</p><p className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">{prepared.currentBio || "No bio yet."}</p></details>
          <div><label htmlFor={`${id}-headline`} className="text-sm font-medium">Suggested headline</label><input id={`${id}-headline`} name="headline" autoComplete="off" className={inputClass} value={suggestion.headline} minLength={2} maxLength={120} required disabled={pending} onChange={(event) => setSuggestion({ ...suggestion, headline: event.target.value })} /></div>
          <div><label htmlFor={`${id}-bio`} className="text-sm font-medium">Suggested bio</label><textarea id={`${id}-bio`} name="bio" className={inputClass} value={suggestion.bio} rows={5} minLength={10} maxLength={2000} required disabled={pending} onChange={(event) => setSuggestion({ ...suggestion, bio: event.target.value })} /></div>
          <div><p className="text-sm font-medium">Skills on your profile</p><p className="mt-1 break-words text-sm text-muted-foreground">{suggestion.skills.map(({ name }) => name).join(", ") || "No confirmed skills yet."}</p></div>
          {suggestion.learningSkills.length ? <div className="rounded-lg bg-secondary/40 p-3"><p className="text-sm font-medium">Skills to learn</p><p className="mt-1 break-words text-sm text-muted-foreground">{suggestion.learningSkills.map(({ name }) => name).join(", ")}</p><p className="mt-2 text-xs text-muted-foreground">You answered No. We will keep these out of your profile.</p></div> : null}
          <p className="text-xs leading-5 text-muted-foreground">Check that the draft reflects your experience. Edit any claim that does not fit.</p>
        </> : <>
          <p className="text-sm text-muted-foreground">These job skills are missing from your saved profile. Answer Yes only for skills you know.</p>
          {prepared.missingSkills.length ? prepared.missingSkills.map((skill) => <fieldset disabled={pending} key={skill.id} className="rounded-lg border p-3"><legend className="px-1 text-sm font-medium">Do you know {skill.name}?</legend><div className="flex gap-5">
            {([true, false] as const).map((known) => <label key={String(known)} className="flex min-h-9 cursor-pointer items-center gap-2 text-sm"><input className="accent-primary" type="radio" name={`${id}-${skill.id}`} value={String(known)} required checked={answers[skill.id] === known} onChange={() => setAnswers((previous) => ({ ...previous, [skill.id]: known }))} />{known ? "Yes" : "No"}</label>)}
          </div></fieldset>) : <p className="text-sm text-primary">Your saved skills cover this job. We can improve your headline and bio.</p>}
        </>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" type="button" disabled={pending} onClick={() => { if (suggestion) setSuggestion(null); else setPrepared(null); }}>{suggestion ? "Change skill answers" : "Choose another job"}</Button>
          <Button type="submit" disabled={pending}>{pending ? suggestion ? "Saving…" : "Drafting…" : suggestion ? "Save profile improvements" : "Generate profile draft"}</Button>
        </div>
      </form>}
      {error ? <p role="alert" className="mt-4 text-sm text-destructive">{error}</p> : null}
    </Modal>
  </>;
}
