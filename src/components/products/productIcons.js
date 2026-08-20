import {
  Bell, Bot, CalendarCheck, Database, Eye, Languages, Lock, Mic, Search,
  ShieldCheck, Smartphone, Sparkles, Stethoscope, Trash2, TrendingUp, Users,
} from 'lucide-react';

/*
 * Feature icon name → component.
 *
 * Deliberately NOT industries/workflowIcons.js. That module infers an icon by
 * regex-matching the step title, and its own header comment warns that the
 * rule order is tuned to eighty-four specific industry workflow titles and is
 * "not safe" to reorder. Feeding it product feature titles would match on
 * incidental words — "Connects to your data" hits /consultation|client/ style
 * rules by accident, and nobody would notice because every miss still renders
 * a plausible-looking glyph.
 *
 * So products name their icon explicitly in data/productDetails.js. A dozen
 * entries is not worth inferring, and an explicit name is reviewable.
 */
const ICONS = {
  bell: Bell,
  bot: Bot,
  calendar: CalendarCheck,
  database: Database,
  eye: Eye,
  languages: Languages,
  lock: Lock,
  mic: Mic,
  search: Search,
  shield: ShieldCheck,
  smartphone: Smartphone,
  stethoscope: Stethoscope,
  trash: Trash2,
  'trending-up': TrendingUp,
  users: Users,
};

// An unknown name still renders — a generic glyph rather than a hole in the
// row — but says so, since the alternative is a silently wrong icon.
export function iconFor(name) {
  const Icon = ICONS[name];
  if (!Icon) {
    if (name) console.warn(`[products] no icon named "${name}" - using fallback`);
    return Sparkles;
  }
  return Icon;
}
