import { useId, type ReactNode } from 'react'
import { useAdmin } from '../api/queries'
import type { DemoState } from '../api/mock'
import { Shell } from '../app/Shell'
import { Loadable } from '../components/Loadable'
import { Segmented } from '../components/Segmented'
import { fill, useCopy } from '../copy/copy'
import { formatWhen } from '../lib/format'
import { Link } from '../lib/Link'
import {
  editorFontSizes,
  updateSettings,
  useSettings,
  type MotionPref,
  type Theme,
} from '../lib/settings'

function Group({ title, help, children }: { title: string; help?: string; children: ReactNode }) {
  const id = useId()
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-2 px-4 text-footnote font-medium text-ink-muted md:px-0">
        {title}
      </h2>
      <div className="divide-y divide-line border-y border-line bg-surface md:rounded-panel md:border">
        {children}
      </div>
      {help ? <p className="mt-2 px-4 text-footnote text-ink-muted md:px-0">{help}</p> : null}
    </section>
  )
}

function Field({
  label,
  children,
  htmlFor,
}: {
  label: string
  children: ReactNode
  htmlFor?: string
}) {
  return (
    <div className="flex min-h-touch flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-body text-ink">
          {label}
        </label>
      ) : (
        <span className="text-body text-ink">{label}</span>
      )}
      {children}
    </div>
  )
}

/** iOS-style switch on a real checkbox, so it is a native form control for every reader. */
function Switch({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex min-h-touch cursor-pointer items-center justify-between gap-4 px-4 py-2.5">
      <span className="text-body text-ink">{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked)
        }}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative h-[31px] w-[51px] shrink-0 rounded-full bg-line-strong transition-colors duration-(--duration-micro) peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus after:absolute after:top-[2px] after:left-[2px] after:size-[27px] after:rounded-full after:bg-surface after:shadow-raised after:transition-transform after:duration-(--duration-state) after:ease-(--ease-out-expo) peer-checked:after:translate-x-5"
      />
    </label>
  )
}

function Value({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-touch flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5">
      <dt className="text-body text-ink">{label}</dt>
      <dd className="num m-0 text-callout text-ink-muted">{children}</dd>
    </div>
  )
}

export default function Settings() {
  const copy = useCopy()
  const c = copy.settings
  const s = useSettings()
  const admin = useAdmin()
  const sizeId = useId()
  const demo = (patch: Partial<DemoState>) => {
    updateSettings({ demo: { ...s.demo, ...patch } })
  }
  return (
    <Shell title={c.title} back={{ href: '/profile', label: copy.nav.profile }}>
      <div className="max-w-2xl space-y-8 pt-4 md:pt-0">
        <Group title={c.appearance} help={c.motionHelp}>
          <Field label={c.theme}>
            <Segmented<Theme>
              label={c.theme}
              value={s.theme}
              onChange={(theme) => {
                updateSettings({ theme })
              }}
              options={(['system', 'light', 'dark'] as const).map((v) => ({
                value: v,
                label: c.themes[v],
              }))}
            />
          </Field>
          <Field label={c.motion}>
            <Segmented<MotionPref>
              label={c.motion}
              value={s.motion}
              onChange={(motion) => {
                updateSettings({ motion })
              }}
              options={(['system', 'reduce', 'allow'] as const).map((v) => ({
                value: v,
                label: c.motions[v],
              }))}
            />
          </Field>
        </Group>

        <Group title={c.editor}>
          <Field label={c.fontSize} htmlFor={sizeId}>
            <select
              id={sizeId}
              value={s.editorFontSize}
              onChange={(e) => {
                updateSettings({ editorFontSize: Number(e.target.value) })
              }}
              className="min-h-9 rounded-control border border-line-strong bg-surface px-3 text-footnote text-ink pointer-coarse:min-h-touch"
            >
              {editorFontSizes.map((n) => (
                <option key={n} value={n}>
                  {fill(c.fontSizeValue, { n })}
                </option>
              ))}
            </select>
          </Field>
          <Field label={c.keymap}>
            <Segmented
              label={c.keymap}
              value={s.keymap}
              onChange={(keymap) => {
                updateSettings({ keymap })
              }}
              options={(['default', 'vim'] as const).map((v) => ({
                value: v,
                label: c.keymaps[v],
              }))}
            />
          </Field>
        </Group>

        <Group title={c.sound} help={c.soundHelp}>
          <Switch
            label={c.sound}
            checked={s.sound}
            onChange={(sound) => {
              updateSettings({ sound })
            }}
          />
        </Group>

        <Group title={c.admin}>
          <Loadable query={admin} what={c.loading} rows={4}>
            {(a) => (
              <dl className="m-0 divide-y divide-line">
                <Value label={c.contentVersion}>{a.contentVersion}</Value>
                <Value label={c.importStatus}>
                  {a.importStatus}, {formatWhen(a.importedAt)}
                </Value>
                <Value label={c.rubric}>{a.rubricVersion}</Value>
                <Value label={c.llmMode}>{c.llmModes[a.llmMode]}</Value>
                <Value label={c.spend}>
                  {fill(c.spendValue, {
                    spent: a.spendMonthUsd.toFixed(2),
                    cap: a.spendCapUsd.toFixed(2),
                  })}
                </Value>
              </dl>
            )}
          </Loadable>
        </Group>

        <Group title={c.prototype} help={c.prototypeHelp}>
          <Switch
            label={c.judgePaused}
            checked={s.demo.judgePaused}
            onChange={(judgePaused) => {
              demo({ judgePaused })
            }}
          />
          <Switch
            label={c.reviewerDown}
            checked={s.demo.reviewerDown}
            onChange={(reviewerDown) => {
              demo({ reviewerDown })
            }}
          />
          <Switch
            label={c.newAccount}
            checked={s.demo.newAccount}
            onChange={(newAccount) => {
              demo({ newAccount })
            }}
          />
          <Switch
            label={c.offline}
            checked={s.demo.offline}
            onChange={(offline) => {
              demo({ offline })
            }}
          />
        </Group>

        <p className="px-4 text-footnote md:px-0">
          <Link
            href="/catalogue"
            className="inline-flex min-h-touch items-center text-ink-muted hover:text-ink"
          >
            {c.catalogue}
          </Link>
        </p>
      </div>
    </Shell>
  )
}
