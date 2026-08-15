// Slack / Outlook connector.
//
// This is the integration SEAM. Today it returns realistic sample messages so
// the recognition-inbox workflow is fully demonstrable without live OAuth. To
// go live, replace the body of `fetchRecognitionMessages` with real calls:
//
//   Slack:   GET https://slack.com/api/conversations.history?channel=<kudos>
//            (Bearer xoxb- token; filter messages that mention the user)
//   Outlook: GET https://graph.microsoft.com/v1.0/me/messages?$search="thanks"
//            (Microsoft Graph, delegated Mail.Read)
//
// Both should run server-side (in the proxy) so tokens never reach the browser,
// mirroring how the ICA key is handled. The shape below is all the UI depends on.

import { DetectedSource } from '../types';

export interface RawMessage {
  id: string;
  source: DetectedSource;
  from: string;
  channel: string;
  receivedAt: string;
  text: string;
}

const SAMPLE_MESSAGES: RawMessage[] = [
  {
    id: 'slk-1',
    source: 'slack',
    from: 'Sarah K.',
    channel: '#design-kudos',
    receivedAt: 'Jul 1, 2026',
    text:
      'Huge shout-out to Aarav 🎉 the new checkout flow you designed for RetailCo went live and ' +
      'conversion is already up 28%. The client literally applauded in the demo. Incredible craft!',
  },
  {
    id: 'slk-2',
    source: 'slack',
    from: 'Dev Team (Marco)',
    channel: 'DM',
    receivedAt: 'Jun 30, 2026',
    text:
      'Aarav, the 40+ components you shipped to the design system this sprint saved us so much ' +
      'front-end time — everything just snapped together. Thank you!',
  },
  {
    id: 'ot-1',
    source: 'outlook',
    from: 'priya.nair@retailco.com',
    channel: 'Re: Checkout launch 🚀',
    receivedAt: 'Jun 29, 2026',
    text:
      'Hi Aarav, on behalf of the whole RetailCo team — thank you for the incredible work on the ' +
      'checkout redesign. Your usability testing caught issues we would never have seen. A pleasure ' +
      'working with you.',
  },
  {
    id: 'ot-2',
    source: 'outlook',
    from: 'james.wright@ibm.com',
    channel: 'Great job in the QBR',
    receivedAt: 'Jun 27, 2026',
    text:
      'Aarav — your facilitation of the discovery workshop with the C-suite was outstanding. You kept ' +
      '12 senior stakeholders aligned and walked out with a clear roadmap. Exactly the leadership we ' +
      'want to see. — James',
  },
  {
    id: 'slk-3',
    source: 'slack',
    from: 'Lena T.',
    channel: '#accessibility',
    receivedAt: 'Jun 26, 2026',
    text:
      'Just want to flag that Aarav quietly fixed the color-contrast issues across the banking ' +
      'prototype so it now passes WCAG AA. Small thing, big impact for our users. 👏',
  },
];

/**
 * Fetch recognition/feedback messages from the connected sources.
 * Returns a promise (with a small delay) so callers treat it like a live fetch.
 */
export function fetchRecognitionMessages(): Promise<RawMessage[]> {
  // TODO(live): swap this for real Slack conversations.history + Graph /me/messages
  // calls made through the proxy. The rest of the app is agnostic to the source.
  return new Promise((resolve) => {
    setTimeout(() => resolve(SAMPLE_MESSAGES), 400);
  });
}
