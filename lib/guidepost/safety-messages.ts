import { crisisContent } from "@/content/safety/crisis";

/**
 * Compose the crisis-pause messages served when the safety screen trips.
 * Verbatim from content/safety/crisis.ts — never adapted, never generated.
 */
export function composeSafetyMessages(): { nodeId: string; text: string }[] {
  const resources = crisisContent.resources
    .map((r) => `${r.name}: ${r.detail}`)
    .join("\n");
  const messages = [
    { nodeId: "safety:intro", text: crisisContent.intro },
    { nodeId: "safety:boundary", text: crisisContent.boundary },
    { nodeId: "safety:resources", text: resources },
    { nodeId: "safety:trusted-adult", text: crisisContent.trustedAdult },
  ];
  // D3: "equip, don't just name" — scripts for approaching a trusted adult.
  // Hidden until Cat supplies the copy (gap G-S1); never generated here.
  const { heading, starters } = crisisContent.startConversation;
  if (starters.length > 0) {
    if (heading)
      messages.push({ nodeId: "safety:start-heading", text: heading });
    starters.forEach((text, i) => {
      messages.push({ nodeId: `safety:start-${i}`, text });
    });
  }
  return messages;
}
