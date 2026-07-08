import type { PathContent, PathId, QuoteBank } from "./schema";
import { green } from "./paths/green";
import { yellow } from "./paths/yellow";
import { greenQuotes } from "./quotes/green";
import { yellowQuotes } from "./quotes/yellow";
import { miniResetToolkits } from "./tools/mini-reset";
import { bigFiveQuiz } from "./quiz/big-five";
import { routerPrompt, routerOptions } from "./router";
import { crisisContent } from "./safety/crisis";

/**
 * Content registry. Paths register here as they're entered from docs/paths/
 * (Green + Yellow in M1; Blue + Red arrive flag-gated in M3).
 *
 * collectAuthoredStrings() feeds the content-integrity lock
 * (content/authored.lock.json): every user-facing string, keyed stably, so
 * any change to Cat's verbatim content is a deliberate, reviewed `content:`
 * commit (regenerate with `pnpm content:lock`).
 */
export const paths: Partial<Record<PathId, PathContent>> = {
  green,
  yellow,
};

export const quoteBanks: Partial<Record<PathId, QuoteBank>> = {
  green: greenQuotes,
  yellow: yellowQuotes,
};

export function collectAuthoredStrings(): Record<string, string> {
  const out: Record<string, string> = {};

  for (const content of Object.values(paths)) {
    for (const node of Object.values(content.nodes)) {
      const prefix = `${content.path}/${node.id}`;
      if (node.juniper) {
        out[`${prefix}/juniper`] = node.juniper.text;
        if (node.juniper.evening) {
          out[`${prefix}/juniper.evening`] = node.juniper.evening;
        }
      }
      if (node.response) {
        out[`${prefix}/response`] = node.response.text;
      }
      if (node.tip) {
        if (node.tip.title) out[`${prefix}/tip.title`] = node.tip.title;
        if (node.tip.body) out[`${prefix}/tip.body`] = node.tip.body;
      }
      if (node.kind === "choice") {
        for (const option of node.options) {
          out[`${prefix}/option:${option.id}`] = option.label;
        }
      }
    }
  }

  for (const bank of Object.values(quoteBanks)) {
    bank.standard.forEach((quote, i) => {
      out[`quotes/${bank.path}/standard/${i}`] = quote;
    });
    bank.evening.forEach((quote, i) => {
      out[`quotes/${bank.path}/evening/${i}`] = quote;
    });
  }

  for (const [toolkitId, toolkit] of Object.entries(miniResetToolkits)) {
    toolkit.sections.forEach((section, s) => {
      out[`mini-reset/${toolkitId}/section/${s}/heading`] = section.heading;
      section.actions.forEach((action, a) => {
        out[`mini-reset/${toolkitId}/section/${s}/action/${a}`] = action;
      });
    });
    out[`mini-reset/${toolkitId}/reentry`] = toolkit.reentry;
  }

  for (const question of bigFiveQuiz) {
    out[`quiz/${question.id}/prompt`] = question.prompt;
    for (const optionChoice of question.options) {
      out[`quiz/${question.id}/option:${optionChoice.key}`] =
        optionChoice.label;
    }
  }

  out["router/prompt"] = routerPrompt.text;
  for (const option of routerOptions) {
    out[`router/option:${option.id}`] = option.label;
  }

  out["safety/crisis/intro"] = crisisContent.intro;
  out["safety/crisis/boundary"] = crisisContent.boundary;
  crisisContent.resources.forEach((resource, i) => {
    out[`safety/crisis/resource/${i}`] =
      `${resource.name} — ${resource.detail}`;
  });
  out["safety/crisis/trusted-adult"] = crisisContent.trustedAdult;
  // D3 conversation-starter slot (gap G-S1) — only locked once Cat fills it.
  if (crisisContent.startConversation.heading) {
    out["safety/crisis/start-conversation/heading"] =
      crisisContent.startConversation.heading;
  }
  crisisContent.startConversation.starters.forEach((s, i) => {
    out[`safety/crisis/start-conversation/${i}`] = s;
  });

  return out;
}
