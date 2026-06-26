import React from 'react';
import type { ArticleBody } from './types';

// External authority links reused across articles.
const OPM_FERS = 'https://www.opm.gov/retirement-services/fers-information/';
const OPM_CSRS = 'https://www.opm.gov/retirement-services/csrs-information/';
const TSP = 'https://www.tsp.gov/';
const SSA = 'https://www.ssa.gov/';

function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith('http');
  return (
    <a
      href={href}
      className="text-blue underline-offset-2 hover:underline"
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

export const ARTICLE_BODIES: Record<string, ArticleBody> = {
  'fers-high-3-salary-explained': {
    lead:
      'Almost every dollar of your FERS pension traces back to one number: your High-3 average salary. Because the annuity formula multiplies this figure by your years of service, getting it right is the single most important step in any retirement estimate.',
    keyTakeaways: [
      'High-3 is the highest average of basic pay over any 36 consecutive months.',
      'Only "basic pay" counts — overtime, bonuses, and most lump sums do not.',
      'Locality pay generally counts; the three years usually aren’t your final calendar years.',
      'The FERS formula is High-3 × years of creditable service × multiplier (1.0% or 1.1%).',
    ],
    blocks: [
      { type: 'h2', text: 'What "High-3" actually means' },
      {
        type: 'p',
        text: 'Your High-3 is the highest average annual rate of basic pay you earned during any 36 consecutive months of creditable Federal service. The word "consecutive" matters: it is a continuous three-year window, not your three best calendar years cherry-picked from a career. For most employees the High-3 falls in the final three years of service because pay generally rises over time — but that is a tendency, not a rule. An employee who took a downgrade, moved to a lower locality, or dropped to part-time at the end of their career may have a High-3 that sits earlier in their timeline.',
      },
      { type: 'h2', text: 'What counts as "basic pay"' },
      {
        type: 'p',
        text: 'The High-3 is built only from basic pay — the pay from which retirement deductions are withheld. This is a narrower figure than your total gross income.',
      },
      {
        type: 'ul',
        items: [
          'Counts: your scheduled base salary and locality pay (and certain law-enforcement availability pay or premium pay specifically defined as basic pay).',
          'Does NOT count: overtime, bonuses and awards, holiday pay, military pay, "cash" allowances, and most one-time lump-sum payments.',
        ],
      },
      {
        type: 'callout',
        title: 'Common mistake',
        text: 'Using your W-2 gross or your "total compensation" figure inflates the High-3 and overstates your pension. Use your base salary plus locality only.',
      },
      { type: 'h2', text: 'How the 36-month window is chosen' },
      {
        type: 'p',
        text: 'OPM looks across your entire service history and identifies the continuous 36-month stretch that produces the highest average. Each pay rate is weighted by how long you held it. If you received a step increase or promotion partway through a year, the average reflects the portion of the year at each rate — not a simple average of the salaries.',
      },
      { type: 'h2', text: 'A worked example' },
      {
        type: 'p',
        text: 'Suppose an employee held these basic-pay rates during their final three years:',
      },
      {
        type: 'table',
        caption: 'Sample 36-month basic-pay history',
        head: ['Period', 'Annual basic pay', 'Time at rate'],
        rows: [
          ['Year 1', '$98,000', '12 months'],
          ['Year 2', '$101,000', '12 months'],
          ['Year 3', '$104,000', '12 months'],
        ],
      },
      {
        type: 'p',
        text: 'The simple average here is ($98,000 + $101,000 + $104,000) ÷ 3 = $101,000. That $101,000 is the High-3. Now apply the FERS formula for someone retiring at 62 with 30 years of service and the 1.1% multiplier: $101,000 × 30 × 1.1% = $33,330 per year before survivor elections and insurance deductions.',
      },
      { type: 'h2', text: 'The 1.0% vs 1.1% multiplier' },
      {
        type: 'p',
        text: 'The standard FERS multiplier is 1.0% per year of service. It increases to 1.1% only if you retire at age 62 or older with at least 20 years of creditable service. On a 30-year career that 0.1% difference is worth roughly 10% more pension for life, which is why many employees model working until 62 specifically to capture it.',
      },
      {
        type: 'p',
        text: (
          <>
            You can apply your own numbers using the <A href="/fers">FERS annuity calculator</A>, and
            see how the High-3 flows into a full retirement picture in the{' '}
            <A href="/full">full retirement analysis</A>.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Does locality pay count toward my High-3?',
            a: 'Yes. Locality pay is part of basic pay, so it is included in the High-3 average for most General Schedule employees.',
          },
          {
            q: 'Do overtime hours increase my High-3?',
            a: 'Generally no. Overtime is not basic pay and is excluded, with limited exceptions such as certain law-enforcement availability pay that is statutorily defined as basic pay.',
          },
          {
            q: 'Is the High-3 always my final three years?',
            a: 'Usually, because pay tends to rise, but not always. If your highest-paid 36 consecutive months occurred earlier, that window is used instead.',
          },
          {
            q: 'Where can I confirm the official rules?',
            a: 'The Office of Personnel Management publishes the authoritative FERS computation rules at opm.gov. This article is educational and not a substitute for an official OPM estimate.',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative reference: <A href={OPM_FERS}>OPM — FERS Information</A>. This site is not
            affiliated with the U.S. government.
          </>
        ),
      },
    ],
  },

  'fers-vs-csrs': {
    lead:
      'The Federal Employees Retirement System (FERS) and the older Civil Service Retirement System (CSRS) are built on completely different philosophies. Knowing which one applies to you — and how each is structured — is the foundation of every other retirement decision.',
    keyTakeaways: [
      'CSRS is a single large pension; FERS is a three-part system (pension + TSP + Social Security).',
      'Most employees hired after 1983 are under FERS; CSRS largely covers pre-1984 hires.',
      'CSRS has no Social Security from federal service; FERS is integrated with Social Security.',
      'FERS includes agency TSP matching; CSRS does not.',
    ],
    blocks: [
      { type: 'h2', text: 'Two systems, two eras' },
      {
        type: 'p',
        text: 'CSRS was the federal retirement system for most of the 20th century. FERS replaced it for employees first hired in 1984 or later, and most CSRS-covered employees who left and returned. The reason the systems feel so different is that they were designed around different assumptions: CSRS employees generally do not pay into Social Security for their federal work and rely on a single, generous pension; FERS employees pay Social Security taxes and receive a smaller pension that is meant to be combined with Social Security and a funded retirement account.',
      },
      { type: 'h2', text: 'The three legs of FERS' },
      {
        type: 'ol',
        items: [
          'The FERS basic annuity — a defined-benefit pension based on High-3 salary and years of service.',
          'The Thrift Savings Plan (TSP) — a defined-contribution account with agency automatic and matching contributions of up to 5%.',
          'Social Security — FERS employees pay into and earn Social Security benefits like private-sector workers.',
        ],
      },
      {
        type: 'p',
        text: 'CSRS, by contrast, is essentially one leg: a large pension. CSRS employees can contribute to the TSP, but they receive no agency match, and their federal service does not earn Social Security credits.',
      },
      { type: 'h2', text: 'Pension formulas compared' },
      {
        type: 'table',
        caption: 'FERS vs CSRS basic annuity formulas',
        head: ['Feature', 'FERS', 'CSRS'],
        rows: [
          ['Multiplier', '1.0% (1.1% at 62 with 20+ yrs)', 'Tiered: 1.5% / 1.75% / 2.0%'],
          ['Based on', 'High-3 × years × multiplier', 'High-3 × tiered schedule'],
          ['Social Security', 'Yes, earned separately', 'No (from federal service)'],
          ['TSP agency match', 'Up to 5%', 'No match (auto 0%)'],
          ['Typical pension size', 'Smaller standalone', 'Larger standalone'],
        ],
      },
      {
        type: 'p',
        text: 'The CSRS schedule awards 1.5% per year for the first 5 years, 1.75% for years 6–10, and 2.0% for every year beyond 10. A 30-year CSRS employee therefore earns roughly 56.25% of High-3, while a 30-year FERS employee at 1.0% earns 30% — but the FERS retiree also has Social Security and a matched TSP balance to add on top.',
      },
      { type: 'h2', text: 'Which system am I in?' },
      {
        type: 'p',
        text: 'Your retirement coverage is recorded on your SF-50 (Notification of Personnel Action) in the "Retirement Plan" field, and on your Leave and Earnings Statement. Common codes include "K" or "KF" for FERS variants and "1" or "6" for CSRS variants. Employees with a break in service may be "CSRS Offset" — a hybrid covered separately in our CSRS Offset guide.',
      },
      { type: 'h2', text: 'Why it changes your planning' },
      {
        type: 'p',
        text: 'A CSRS retiree can often plan around the pension alone. A FERS retiree must coordinate three income streams that start at different ages and follow different rules — for example, the FERS pension and the Special Retirement Supplement may begin before Social Security, and the TSP can be drawn flexibly. That coordination is exactly what makes the FERS picture more complex but also more flexible.',
      },
      {
        type: 'p',
        text: (
          <>
            Model your own situation with the <A href="/fers">FERS calculator</A> or the{' '}
            <A href="/csrs">CSRS calculator</A>, then combine everything in the{' '}
            <A href="/full">full retirement analysis</A>.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Is CSRS always better than FERS?',
            a: 'Not necessarily. CSRS provides a larger standalone pension, but FERS adds Social Security and a matched TSP. Over a full career the total FERS package can be competitive, especially for those who maximize TSP contributions.',
          },
          {
            q: 'Can I switch from FERS to CSRS?',
            a: 'No. New CSRS coverage was closed to new hires after 1983. Your system is determined by your hire date and service history.',
          },
          {
            q: 'Do FERS employees really pay Social Security?',
            a: 'Yes. FERS employees pay the standard Social Security payroll tax and earn benefits based on their full earnings history.',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative references: <A href={OPM_FERS}>OPM FERS</A> and <A href={OPM_CSRS}>OPM CSRS</A>.
            This site is not affiliated with the U.S. government.
          </>
        ),
      },
    ],
  },

  'fers-minimum-retirement-age': {
    lead:
      'The FERS Minimum Retirement Age (MRA) is the earliest age at which you can retire if you have enough years of service. It is not a single number — it slides between 55 and 57 depending on the year you were born.',
    keyTakeaways: [
      'MRA ranges from 55 (born before 1948) to 57 (born 1970 or later).',
      'Reaching your MRA only matters when paired with enough years of service.',
      'MRA + 30 years gives an immediate, unreduced annuity.',
      'MRA + 10 years is allowed but the annuity is reduced unless postponed.',
    ],
    blocks: [
      { type: 'h2', text: 'The full MRA chart' },
      {
        type: 'table',
        caption: 'FERS Minimum Retirement Age by year of birth',
        head: ['Year of birth', 'Minimum Retirement Age'],
        rows: [
          ['Before 1948', '55'],
          ['1948–1952', '55 plus 2–10 months'],
          ['1953–1964', '56'],
          ['1965–1969', '56 plus 2–10 months'],
          ['1970 or later', '57'],
        ],
      },
      {
        type: 'p',
        text: 'Within the transition bands, the MRA increases by two months for each birth year. For example, someone born in 1966 has an MRA of 56 and 4 months, and someone born in 1968 has an MRA of 56 and 8 months. Anyone born in 1970 or later has a flat MRA of 57.',
      },
      { type: 'h2', text: 'Age alone is not enough' },
      {
        type: 'p',
        text: 'Hitting your MRA is only half the equation. To retire you also need a qualifying combination of age and creditable service. The main FERS pathways are:',
      },
      {
        type: 'table',
        caption: 'FERS immediate retirement eligibility',
        head: ['Age', 'Years of service', 'Result'],
        rows: [
          ['MRA', '30', 'Immediate, unreduced annuity'],
          ['60', '20', 'Immediate, unreduced annuity'],
          ['62', '5', 'Immediate, unreduced annuity'],
          ['MRA', '10', 'Reduced annuity (MRA+10)'],
        ],
      },
      { type: 'h2', text: 'Why MRA + 30 is the popular target' },
      {
        type: 'p',
        text: 'The MRA + 30 pathway is attractive because it produces a full annuity at the earliest possible age for long-career employees, and it makes you eligible for the FERS Special Retirement Supplement that bridges income until age 62. Employees who started young can sometimes reach MRA + 30 in their late 50s.',
      },
      {
        type: 'callout',
        title: 'Plan around the thresholds',
        text: 'Because eligibility hinges on exact age and service combinations, retiring even a few weeks after crossing a threshold can change whether your annuity is reduced. Always check dates near birthdays and service anniversaries.',
      },
      {
        type: 'p',
        text: (
          <>
            Find your earliest date with the <A href="/eligibility">retirement eligibility calculator</A>,
            then estimate the resulting pension with the <A href="/fers">FERS calculator</A>.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'What is my MRA if I was born in 1969?',
            a: 'Your MRA is 56 and 10 months. Birth years 1965–1969 add two months per year on top of 56.',
          },
          {
            q: 'Can I retire at my MRA with only 10 years?',
            a: 'Yes, under the MRA+10 provision, but the annuity is reduced by 5% for each year you are under age 62 — unless you postpone it.',
          },
          {
            q: 'Does unused sick leave help me reach my MRA?',
            a: 'No. Sick leave adds to the service used to compute your annuity, but it does not count toward the service needed to become eligible.',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative reference: <A href={OPM_FERS}>OPM — FERS eligibility</A>. This site is not
            affiliated with the U.S. government.
          </>
        ),
      },
    ],
  },

  'mra-10-vs-postponed-retirement': {
    lead:
      'If you reach your Minimum Retirement Age with at least 10 years of service but fewer than 30, you can retire under "MRA+10." But the immediate annuity comes with a steep age reduction — and postponing it can erase the penalty entirely.',
    keyTakeaways: [
      'MRA+10 lets you retire with 10–29 years of service at your MRA.',
      'Taking the annuity immediately cuts it 5% for every year you are under 62.',
      'Postponing the start date avoids the reduction and can restore FEHB.',
      'The trade-off is income now (reduced) vs. a larger annuity later.',
    ],
    blocks: [
      { type: 'h2', text: 'The 5% age reduction' },
      {
        type: 'p',
        text: 'Under MRA+10, if you begin receiving your annuity immediately, it is permanently reduced by 5% for each year you are under age 62 (that is 5/12 of one percent for each month). Retire four years early and your pension is cut by roughly 20% for the rest of your life. The reduction is permanent — it does not bounce back when you turn 62.',
      },
      {
        type: 'table',
        caption: 'Example MRA+10 reduction by starting age',
        head: ['Age annuity begins', 'Years under 62', 'Approx. reduction'],
        rows: [
          ['57', '5', '25%'],
          ['58', '4', '20%'],
          ['60', '2', '10%'],
          ['62', '0', '0%'],
        ],
      },
      { type: 'h2', text: 'The postponed annuity option' },
      {
        type: 'p',
        text: 'Instead of starting your annuity right away, you can separate from service and postpone the start date to a later age. By postponing until you reach an age where the reduction is small or zero (for example age 60 with 20 years, or age 62), you avoid most or all of the penalty. This is the key insight many employees miss: MRA+10 retirement and an immediate annuity are not the same decision.',
      },
      {
        type: 'callout',
        title: 'FEHB and FEGLI matter here',
        text: 'When you postpone, your federal health (FEHB) and life insurance (FEGLI) are suspended during the gap — but they can be reinstated when your postponed annuity begins, provided you met the five-year enrollment rule before separating. Taking the immediate reduced annuity instead lets coverage continue without a gap.',
      },
      { type: 'h2', text: 'Immediate vs postponed: how to choose' },
      {
        type: 'ul',
        items: [
          'Choose immediate (reduced) if you need the income now or cannot bridge a gap in health coverage.',
          'Choose postponed if you can cover health insurance another way and want the larger, unreduced annuity later.',
          'Run the math on lifetime value: a smaller check for more years vs. a larger check that starts later.',
        ],
      },
      {
        type: 'p',
        text: 'Note that MRA+10 retirees are generally not eligible for the FERS Special Retirement Supplement, which is another reason the postponed strategy is often more valuable than it first appears.',
      },
      {
        type: 'p',
        text: (
          <>
            Compare starting ages with the <A href="/fers">FERS calculator</A> and confirm your
            eligibility date in the <A href="/eligibility">eligibility calculator</A>.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Is the MRA+10 reduction permanent?',
            a: 'Yes. If you take the immediate annuity, the 5%-per-year reduction stays for life. Postponing the start date is the way to avoid it.',
          },
          {
            q: 'Can I keep my FEHB if I postpone?',
            a: 'Coverage is suspended during the postponement gap but can be reinstated when the postponed annuity begins, if you met the five-year FEHB enrollment requirement before you left.',
          },
          {
            q: 'Do MRA+10 retirees get the FERS supplement?',
            a: 'Generally no. The Special Retirement Supplement is for those who retire with an immediate, unreduced annuity, which MRA+10 immediate retirements are not.',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative reference: <A href={OPM_FERS}>OPM — FERS</A>. This site is not affiliated with
            the U.S. government.
          </>
        ),
      },
    ],
  },

  'fers-special-retirement-supplement': {
    lead:
      'The FERS Special Retirement Supplement (sometimes called the "FERS supplement" or SRS) fills the income gap between the day you retire and the day you can collect Social Security at 62. For employees who retire early with a full annuity, it can be worth hundreds of dollars a month.',
    keyTakeaways: [
      'The supplement bridges income from retirement until age 62.',
      'It approximates the Social Security you earned during federal service.',
      'You must retire with an immediate, unreduced annuity to qualify.',
      'It is subject to the Social Security earnings test if you keep working.',
    ],
    blocks: [
      { type: 'h2', text: 'Who qualifies' },
      {
        type: 'p',
        text: 'The supplement is paid to FERS retirees who leave with an immediate, unreduced annuity before age 62. The most common qualifying groups are employees who retire at their MRA with 30 years, at age 60 with 20 years, and special-provision employees (law enforcement officers, firefighters, and air traffic controllers) who retire under their earlier rules. Employees who retire under MRA+10 with a reduced annuity, and anyone who retires at 62 or later, do not receive it.',
      },
      { type: 'h2', text: 'How it is estimated' },
      {
        type: 'p',
        text: 'The supplement approximates the portion of your age-62 Social Security benefit that you earned during your FERS-covered federal career. A simplified way to picture it: take your estimated Social Security benefit at 62, multiply by your years of FERS service, and divide by 40. So 30 years of FERS service would yield roughly 30/40 (75%) of that estimated benefit as the supplement.',
      },
      {
        type: 'callout',
        title: 'It is not your full Social Security',
        text: 'The supplement only reflects federal service, not your entire Social Security record. Your actual Social Security benefit at 62 (which can include non-federal work) is calculated separately by the SSA.',
      },
      { type: 'h2', text: 'The earnings test' },
      {
        type: 'p',
        text: 'Once you reach your MRA, the supplement is subject to the same annual earnings test that applies to early Social Security. If you take a post-retirement job and your earned income exceeds the annual limit, the supplement is reduced by $1 for every $2 over the limit. Importantly, the earnings test applies to wages and self-employment income — not to your annuity, TSP withdrawals, or investment income.',
      },
      { type: 'h2', text: 'When it ends' },
      {
        type: 'p',
        text: 'The supplement automatically stops the month you turn 62, whether or not you actually file for Social Security at that time. It is meant only as a bridge. Many retirees use the years between retirement and 62 to decide when to claim Social Security, which can be delayed to 70 for a larger benefit.',
      },
      {
        type: 'p',
        text: (
          <>
            Estimate the pieces with the <A href="/fers">FERS calculator</A> and the{' '}
            <A href="/ss">Social Security estimator</A>, then see them together in the{' '}
            <A href="/full">full analysis</A>.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Does the supplement increase with COLAs?',
            a: 'No. Unlike the FERS basic annuity, the Special Retirement Supplement does not receive annual cost-of-living adjustments.',
          },
          {
            q: 'Will working part-time reduce my supplement?',
            a: 'It can. Once you reach your MRA, earned income above the annual Social Security earnings limit reduces the supplement by $1 for every $2 over the limit.',
          },
          {
            q: 'Do law enforcement retirees get the supplement before MRA?',
            a: 'Special-provision retirees can receive the supplement before reaching their MRA, and the earnings test generally does not apply to them until they reach their MRA.',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative references: <A href={OPM_FERS}>OPM FERS</A> and <A href={SSA}>SSA.gov</A>. This
            site is not affiliated with the U.S. government.
          </>
        ),
      },
    ],
  },

  'tsp-agency-matching-explained': {
    lead:
      'For FERS employees, the Thrift Savings Plan is where the government helps you build wealth directly. Contribute enough and you can earn a 5% agency match every pay period — but contribute too little and you forfeit free money you can never recover.',
    keyTakeaways: [
      'FERS employees get an automatic 1% agency contribution regardless of what they save.',
      'The match adds up to 4% more — for a total of 5% — when you contribute at least 5%.',
      'The match is dollar-for-dollar on the first 3% and 50 cents on the next 2%.',
      'Contributing less than 5% leaves guaranteed money on the table.',
    ],
    blocks: [
      { type: 'h2', text: 'The two kinds of agency money' },
      {
        type: 'p',
        text: 'FERS employees receive two distinct forms of agency contribution. The first is the Agency Automatic Contribution: 1% of your basic pay, deposited whether or not you contribute anything yourself. The second is the Agency Matching Contribution, which only happens when you contribute from your own pay.',
      },
      { type: 'h2', text: 'How the match is structured' },
      {
        type: 'table',
        caption: 'FERS TSP agency contributions per pay period',
        head: ['Your contribution', 'Agency automatic', 'Agency match', 'Total agency'],
        rows: [
          ['0%', '1%', '0%', '1%'],
          ['3%', '1%', '3%', '4%'],
          ['4%', '1%', '3.5%', '4.5%'],
          ['5% or more', '1%', '4%', '5%'],
        ],
      },
      {
        type: 'p',
        text: 'The matching tiers are dollar-for-dollar on the first 3% of pay you contribute, then 50 cents on the dollar for the next 2%. Once you contribute 5% of your own pay, you receive the full 4% match plus the 1% automatic — a total of 5% from the agency on top of your own 5%. Contributing more than 5% is still wise for your own savings, but it does not increase the match.',
      },
      {
        type: 'callout',
        title: 'The most expensive mistake in the TSP',
        text: 'If you contribute only 3%, you leave 1% of your salary in match on the table every pay period — money that compounds for decades. Always contribute at least 5% to capture the full match.',
      },
      { type: 'h2', text: 'Watch out for "front-loading"' },
      {
        type: 'p',
        text: 'The match is calculated each pay period, not annually. If you contribute aggressively early in the year and hit the IRS elective deferral limit before December, your contributions stop — and so does the match for the remaining pay periods. To capture every dollar of match, spread your contributions evenly across all pay periods so you are contributing at least 5% in each one.',
      },
      { type: 'h2', text: 'Traditional vs Roth and the match' },
      {
        type: 'p',
        text: 'You can contribute as traditional (pre-tax) or Roth (after-tax), but note that all agency contributions are always deposited into the traditional balance, regardless of how you contribute. This is just a tax-treatment detail — it does not reduce the amount you receive.',
      },
      {
        type: 'p',
        text: (
          <>
            Project how the match compounds over time with the <A href="/tsp">TSP calculator</A>.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Do CSRS employees get a TSP match?',
            a: 'No. Agency automatic and matching contributions are a FERS feature. CSRS employees may contribute to the TSP but receive no agency money.',
          },
          {
            q: 'Does the Roth TSP get matched?',
            a: 'Your Roth contributions count toward earning the match, but the matching dollars themselves are always deposited into your traditional balance.',
          },
          {
            q: 'What happens if I stop contributing mid-year?',
            a: 'You keep the 1% automatic contribution, but you lose the matching contributions for any pay period in which you contribute nothing.',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative reference: <A href={TSP}>TSP.gov</A>. This site is not affiliated with the U.S.
            government.
          </>
        ),
      },
    ],
  },

  'tsp-withdrawal-strategies': {
    lead:
      'Saving in the Thrift Savings Plan is only half the journey. How you withdraw the money in retirement determines how long it lasts, how much tax you pay, and whether your spouse is protected. The TSP offers several withdrawal paths — and you can combine them.',
    keyTakeaways: [
      'Main options: installment payments, partial withdrawals, a life annuity, and rollovers.',
      'Required Minimum Distributions (RMDs) generally begin at age 73.',
      'Roth and traditional balances are taxed very differently on withdrawal.',
      'You can mix methods rather than choosing only one.',
    ],
    blocks: [
      { type: 'h2', text: 'Your core withdrawal options' },
      {
        type: 'ol',
        items: [
          'Installment payments — regular monthly, quarterly, or annual payments, either a fixed dollar amount or based on life expectancy. You can start, stop, and change these.',
          'Partial / single withdrawals — take a lump sum when you need it while leaving the rest invested.',
          'TSP life annuity — hand a portion of your balance to the TSP annuity provider in exchange for guaranteed lifetime income.',
          'Transfers / rollovers — move funds to an IRA or eligible employer plan for more investment or estate-planning flexibility.',
        ],
      },
      {
        type: 'p',
        text: 'These are not mutually exclusive. A common approach is to set up modest installment payments for steady income, keep the balance invested for growth, and take occasional partial withdrawals for large one-time expenses.',
      },
      { type: 'h2', text: 'Traditional vs Roth at withdrawal' },
      {
        type: 'table',
        caption: 'How TSP balances are taxed when withdrawn',
        head: ['Balance type', 'Taxed on withdrawal?', 'Notes'],
        rows: [
          ['Traditional', 'Yes — ordinary income', 'Contributions and earnings were pre-tax'],
          ['Roth contributions', 'No', 'Already taxed when contributed'],
          ['Roth earnings', 'No, if qualified', 'Account 5+ yrs and age 59½+'],
        ],
      },
      { type: 'h2', text: 'Required Minimum Distributions (RMDs)' },
      {
        type: 'p',
        text: 'The IRS requires you to begin taking minimum distributions from tax-deferred retirement accounts at age 73 (under current law). The TSP will calculate and pay your RMD if you have not already withdrawn at least that amount. Failing to take an RMD triggers a significant IRS penalty, so this is one deadline worth tracking carefully. Note that Roth TSP balances are also subject to TSP RMD rules unless rolled to a Roth IRA — a reason some retirees move Roth funds out.',
      },
      {
        type: 'callout',
        title: 'Sequence matters',
        text: 'Coordinating TSP withdrawals with your pension start date, the FERS supplement, and your Social Security claiming age can meaningfully reduce lifetime taxes. Many retirees draw from traditional balances in lower-income early years and let Roth grow.',
      },
      { type: 'h2', text: 'Watch the early-withdrawal rules' },
      {
        type: 'p',
        text: 'Withdrawals before age 59½ can carry a 10% early-withdrawal penalty, but there are important federal exceptions — for example, if you separate from federal service in or after the year you turn 55 (age 50 for many special-provision employees), penalty-free TSP access can begin earlier than the general IRA rules allow.',
      },
      {
        type: 'p',
        text: (
          <>
            Test different drawdown amounts with the <A href="/tsp">TSP calculator</A> and check whether
            your income covers expenses with the <A href="/gap">retirement gap calculator</A>.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Can I change my installment payments later?',
            a: 'Yes. The modern TSP lets you start, stop, and adjust installment payments and take partial withdrawals with far more flexibility than the old rules allowed.',
          },
          {
            q: 'When do RMDs start?',
            a: 'Under current law, Required Minimum Distributions generally begin at age 73. Confirm the current age, as it has changed in recent legislation.',
          },
          {
            q: 'Is the TSP annuity the same as my FERS pension?',
            a: 'No. The TSP life annuity is an optional product you can buy with your TSP balance. It is separate from the FERS basic annuity (your pension).',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative reference: <A href={TSP}>TSP.gov</A>. This is educational information, not tax
            advice; consult a qualified professional about your situation.
          </>
        ),
      },
    ],
  },

  'military-deposit-buy-back': {
    lead:
      'If you served on active duty before your federal civilian career, you may be able to "buy back" that time by paying a military deposit — adding those years to your creditable service and permanently increasing your pension. Whether it pays off depends on the cost, the deadline, and your career length.',
    keyTakeaways: [
      'A military deposit lets active-duty time count toward your civilian pension.',
      'For FERS, the deposit is generally 3% of your military basic pay, plus interest.',
      'There is an interest-free grace period — paying early avoids added cost.',
      'The deposit must be completed before you retire.',
    ],
    blocks: [
      { type: 'h2', text: 'Why buy back military time?' },
      {
        type: 'p',
        text: 'Your FERS pension is High-3 × years of service × multiplier. Buying back military service increases the "years of service" factor, which raises your annuity for the rest of your life. For a long federal career, even a few added years can be worth tens of thousands of dollars over retirement. Bought-back time can also help you reach eligibility milestones sooner.',
      },
      { type: 'h2', text: 'How the deposit is calculated' },
      {
        type: 'p',
        text: 'For FERS employees, the deposit is generally 3% of the basic pay you earned during your military service (CSRS uses 7%). Note this is your military basic pay from years ago — not your current civilian salary — so the base amount is often modest. Interest is then added, which is why timing matters so much.',
      },
      {
        type: 'callout',
        title: 'The interest clock',
        text: 'There is a grace period (commonly described as about two to three years from when you are first covered) during which no interest accrues. Pay within that window and you owe only the base 3%. Wait longer and compounding interest can substantially increase the total.',
      },
      { type: 'h2', text: 'The deadline that cannot be missed' },
      {
        type: 'p',
        text: 'The military deposit must be paid in full before you retire — there is no option to pay it from your annuity afterward. Because the paperwork (estimating your military earnings, getting the official calculation, and arranging payroll deductions) can take months, financial planners generally recommend starting the process years before your planned retirement date.',
      },
      { type: 'h2', text: 'When the buy-back pays off' },
      {
        type: 'ul',
        items: [
          'It usually pays off for employees with a long remaining federal career, because the higher annuity is collected for many years.',
          'It is especially valuable if the bought-back years also unlock earlier eligibility or the 1.1% multiplier.',
          'It is less compelling if you are very close to retirement with little time for the higher pension to recoup the cost — run the breakeven.',
        ],
      },
      {
        type: 'p',
        text: 'A quick way to judge value: divide the deposit cost by the annual pension increase it buys. The result is roughly how many years of retirement it takes to break even. Most federal retirees live well beyond a typical breakeven of just a few years.',
      },
      {
        type: 'p',
        text: (
          <>
            Estimate your deposit and the resulting pension bump with the{' '}
            <A href="/military">military deposit calculator</A> and the <A href="/fers">FERS calculator</A>.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Do I have to buy back military time?',
            a: 'For post-1956 military service under FERS, the time generally only counts toward your civilian annuity if you make the deposit. Without it, the service usually does not increase your pension.',
          },
          {
            q: 'What if I already receive military retired pay?',
            a: 'Special rules apply if you are receiving military retired pay; you typically must waive it to have the service credited, with exceptions for reserve/disability retirements. Get an official determination before deciding.',
          },
          {
            q: 'Can I pay the deposit after I retire?',
            a: 'No. The deposit must be completed before your retirement is finalized.',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative reference: <A href={OPM_FERS}>OPM — creditable military service</A>. This site
            is not affiliated with the U.S. government.
          </>
        ),
      },
    ],
  },

  'survivor-benefit-election': {
    lead:
      'When you retire under FERS, you decide how much of your annuity should continue to a surviving spouse after your death. The choice reduces your monthly check now, but it protects your spouse’s income later — and it is closely tied to keeping federal health insurance.',
    keyTakeaways: [
      'You can elect a full (50%) or partial (25%) survivor annuity, or none.',
      'The full election reduces your annuity by about 10%; the partial by about 5%.',
      'A survivor annuity election is what lets your spouse keep FEHB after you die.',
      'Declining or reducing the election usually requires spousal consent.',
    ],
    blocks: [
      { type: 'h2', text: 'The FERS survivor options' },
      {
        type: 'table',
        caption: 'FERS survivor benefit elections',
        head: ['Election', 'Survivor receives', 'Your annuity reduction'],
        rows: [
          ['Full survivor benefit', '50% of your annuity', '~10%'],
          ['Partial survivor benefit', '25% of your annuity', '~5%'],
          ['No survivor benefit', 'Nothing', 'None'],
        ],
      },
      {
        type: 'p',
        text: 'The reduction is taken from your gross annuity for life. In exchange, your surviving spouse receives the elected percentage of your unreduced annuity after your death, and that survivor annuity itself receives cost-of-living adjustments.',
      },
      { type: 'h2', text: 'The critical link to FEHB' },
      {
        type: 'callout',
        title: 'No survivor annuity usually means no survivor FEHB',
        text: 'For your spouse to continue Federal Employees Health Benefits coverage after your death, you generally must elect at least a partial survivor annuity. Waiving the survivor benefit to get a bigger check can unintentionally cut off your spouse’s health insurance — often the more valuable benefit.',
      },
      { type: 'h2', text: 'Spousal consent' },
      {
        type: 'p',
        text: 'Because the decision affects your spouse directly, federal rules require your spouse’s notarized consent if you want to elect less than the full survivor annuity (or none). This protects spouses from being left without income or coverage.',
      },
      { type: 'h2', text: 'How to weigh the decision' },
      {
        type: 'ul',
        items: [
          'Consider your spouse’s own pension, Social Security, and savings — and their life expectancy.',
          'Factor in FEHB: the survivor annuity is the gateway to lifetime federal health coverage for your spouse.',
          'Compare the lifetime cost of the reduction against the protection it provides; for many couples the full election is worth it.',
          'Remember the survivor annuity receives COLAs, so its real value grows over time.',
        ],
      },
      {
        type: 'p',
        text: (
          <>
            See how each election changes your net annuity with the <A href="/fers">FERS calculator</A>,
            and view the household picture in the <A href="/full">full analysis</A>.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Can I change my survivor election after I retire?',
            a: 'Generally only in narrow circumstances (for example, a marriage after retirement, within a deadline). Most elections are locked in at retirement, so choose carefully.',
          },
          {
            q: 'Does the survivor annuity get COLAs?',
            a: 'Yes. The survivor annuity receives the same cost-of-living adjustments as the regular FERS annuity.',
          },
          {
            q: 'What if my spouse has their own strong pension?',
            a: 'Some couples elect a partial or no survivor benefit when the surviving spouse is already well covered — but weigh the FEHB consequences before declining entirely.',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative reference: <A href={OPM_FERS}>OPM — FERS survivor benefits</A>. This site is not
            affiliated with the U.S. government.
          </>
        ),
      },
    ],
  },

  'csrs-offset-explained': {
    lead:
      'CSRS Offset is a hybrid that confuses many federal employees. You are covered by CSRS, but you also pay into Social Security — and at age 62 your CSRS pension is "offset" by the Social Security you earned. The good news: your total income usually stays about the same.',
    keyTakeaways: [
      'CSRS Offset employees are covered by both CSRS and Social Security.',
      'At 62, the CSRS annuity is reduced by the Social Security earned during offset service.',
      'Total income generally stays similar — you are not losing money, just shifting the source.',
      'It typically applies to employees with a break in service who returned after 1983.',
    ],
    blocks: [
      { type: 'h2', text: 'How someone ends up in CSRS Offset' },
      {
        type: 'p',
        text: 'CSRS Offset generally applies to employees who had earlier CSRS-covered service, left federal employment, and then returned after 1983 with at least five years of prior CSRS coverage. Rather than placing them fully into FERS, the rules kept them under CSRS but also enrolled them in Social Security — hence "offset."',
      },
      { type: 'h2', text: 'How the offset works at 62' },
      {
        type: 'p',
        text: 'While working, a CSRS Offset employee pays reduced CSRS contributions plus Social Security taxes. The CSRS pension is calculated using the normal CSRS formula. Then, at age 62 (or at retirement if later), the CSRS annuity is reduced — "offset" — by the amount of Social Security benefit attributable to the offset service.',
      },
      {
        type: 'callout',
        title: 'You are not losing money',
        text: 'The offset is not a penalty. The dollars removed from your CSRS annuity are essentially replaced by the Social Security benefit you earned. Your combined income from CSRS plus Social Security is designed to be roughly the same as a pure CSRS pension would have been.',
      },
      { type: 'h2', text: 'A simplified illustration' },
      {
        type: 'table',
        caption: 'Illustrative CSRS Offset income before and after age 62',
        head: ['Source', 'Before 62', 'After 62 (offset)'],
        rows: [
          ['CSRS annuity', '$40,000', '$31,000'],
          ['Social Security', '$0', '$9,000'],
          ['Total', '$40,000', '$40,000'],
        ],
      },
      {
        type: 'p',
        text: 'The figures above are illustrative only. The actual offset equals the lesser of (a) the Social Security benefit attributable to your offset service, or (b) a proportional share based on your years of offset service divided by 40.',
      },
      { type: 'h2', text: 'A note on WEP and GPO' },
      {
        type: 'p',
        text: 'CSRS Offset employees were historically concerned about the Windfall Elimination Provision and Government Pension Offset. As covered in our WEP/GPO guide, those provisions were eliminated by the Social Security Fairness Act, simplifying the picture for many public retirees.',
      },
      {
        type: 'p',
        text: (
          <>
            Estimate your CSRS pension with the <A href="/csrs">CSRS calculator</A> and your Social
            Security with the <A href="/ss">Social Security estimator</A>.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Is CSRS Offset worse than regular CSRS?',
            a: 'Generally no. Your total income from the offset CSRS annuity plus Social Security is designed to approximate what a full CSRS pension would have paid.',
          },
          {
            q: 'Does the offset happen if I never claim Social Security?',
            a: 'The CSRS offset is applied at age 62 based on the Social Security you are entitled to from offset service, whether or not you actually file. Coordinate your claiming strategy carefully.',
          },
          {
            q: 'How do I know if I am CSRS Offset?',
            a: 'Check the retirement plan code on your SF-50 and Leave and Earnings Statement, or ask your HR/benefits office for an official determination.',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative references: <A href={OPM_CSRS}>OPM CSRS</A> and <A href={SSA}>SSA.gov</A>. This
            site is not affiliated with the U.S. government.
          </>
        ),
      },
    ],
  },

  'unused-sick-leave-credit': {
    lead:
      'Unused sick leave is one of the few federal benefits that quietly rewards employees who rarely used it. At retirement, your accumulated sick-leave hours are converted into extra creditable service that increases your annuity — for free.',
    keyTakeaways: [
      'Unused sick leave is converted to additional service for the annuity computation.',
      'The conversion uses 2,087 hours = one year of service.',
      'It increases your pension but does NOT count toward retirement eligibility.',
      'Since 2014, FERS retirees receive full credit for unused sick leave.',
    ],
    blocks: [
      { type: 'h2', text: 'How the conversion works' },
      {
        type: 'p',
        text: 'At retirement, OPM converts your unused sick-leave balance into months and days of additional creditable service using the standard chart based on 2,087 hours per work year. That added service is then plugged into your annuity formula. For example, roughly 2,087 hours of unused sick leave equals about one full year of service credit — which, at the FERS 1% multiplier, adds about 1% of your High-3 to your annual pension permanently.',
      },
      {
        type: 'table',
        caption: 'Approximate sick-leave to service conversion',
        head: ['Unused sick leave', 'Approx. added service'],
        rows: [
          ['174 hours', '≈ 1 month'],
          ['522 hours', '≈ 3 months'],
          ['1,044 hours', '≈ 6 months'],
          ['2,087 hours', '≈ 1 year'],
        ],
      },
      { type: 'h2', text: 'The crucial limitation' },
      {
        type: 'callout',
        title: 'Sick leave does not make you eligible sooner',
        text: 'Sick-leave credit is added only to the service used to compute your annuity amount — never to the service used to determine whether you are eligible to retire. You must independently meet an age-and-service eligibility rule first.',
      },
      {
        type: 'p',
        text: 'In other words, if you need 30 years of service to retire at your MRA, sick leave will not bridge a shortfall to reach 30. But once you are eligible, every hour of unused sick leave makes your pension a little larger.',
      },
      { type: 'h2', text: 'The 2014 FERS change' },
      {
        type: 'p',
        text: 'There was a transition period when FERS employees received only partial credit for unused sick leave. That phase-in ended, and since 2014 FERS retirees receive 100% credit, putting them on equal footing with CSRS employees, who always received full credit.',
      },
      { type: 'h2', text: 'Planning implications' },
      {
        type: 'ul',
        items: [
          'Avoid "burning" large amounts of sick leave just before retirement — unused hours convert to pension value.',
          'Time your retirement date to capture the maximum balance, since sick leave keeps accruing until you separate.',
          'Remember leftover annual leave is paid as a lump sum, but sick leave is converted to service credit instead.',
        ],
      },
      {
        type: 'p',
        text: (
          <>
            See how added service changes your pension with the <A href="/fers">FERS</A> or{' '}
            <A href="/csrs">CSRS</A> calculator.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Can sick leave help me reach 20 or 30 years for eligibility?',
            a: 'No. Sick leave only increases the service used to compute your annuity amount, not the service used to qualify for retirement.',
          },
          {
            q: 'Is unused annual leave treated the same way?',
            a: 'No. Unused annual leave is paid out as a lump sum at retirement. Only sick leave is converted into added service credit.',
          },
          {
            q: 'Do FERS and CSRS employees get the same sick-leave credit?',
            a: 'Yes, now. Since 2014, FERS retirees receive full credit, matching the treatment CSRS employees have always received.',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative reference: <A href={OPM_FERS}>OPM — creditable service</A>. This site is not
            affiliated with the U.S. government.
          </>
        ),
      },
    ],
  },

  'wep-gpo-repeal': {
    lead:
      'For decades, the Windfall Elimination Provision (WEP) and Government Pension Offset (GPO) reduced Social Security benefits for many public servants — including some federal retirees. The Social Security Fairness Act eliminated both, marking the biggest change to public-pension Social Security rules in a generation.',
    keyTakeaways: [
      'The Social Security Fairness Act repealed both WEP and GPO.',
      'WEP had reduced a worker’s own Social Security if they also had a non-covered pension.',
      'GPO had reduced spousal/survivor Social Security for those with a non-covered pension.',
      'CSRS retirees were the federal group most affected by the repeal.',
    ],
    blocks: [
      { type: 'h2', text: 'What WEP and GPO used to do' },
      {
        type: 'p',
        text: 'WEP and GPO existed because some government employees earned a pension from work where they did not pay Social Security taxes — most notably CSRS federal employees. The two provisions reduced Social Security benefits to account for that "non-covered" pension.',
      },
      {
        type: 'ul',
        items: [
          'WEP (Windfall Elimination Provision) reduced a person’s OWN Social Security benefit if they also received a pension from non-covered employment.',
          'GPO (Government Pension Offset) reduced the SPOUSAL or SURVIVOR Social Security benefit — often to zero — for someone receiving a non-covered government pension.',
        ],
      },
      { type: 'h2', text: 'What the Social Security Fairness Act changed' },
      {
        type: 'p',
        text: 'The Social Security Fairness Act eliminated both WEP and GPO. As a result, affected retirees have their Social Security benefits calculated under the standard rules, without the special reductions. The Social Security Administration has been recalculating affected benefits and issuing adjustments, including retroactive amounts for benefits payable after the law’s effective date.',
      },
      {
        type: 'callout',
        title: 'Who benefits most',
        text: 'CSRS retirees and CSRS Offset retirees were the federal employees most affected by WEP and GPO. Many will see higher Social Security benefits — either their own (previously cut by WEP) or spousal/survivor benefits (previously cut by GPO).',
      },
      { type: 'h2', text: 'Does this affect FERS employees?' },
      {
        type: 'p',
        text: 'Most pure-FERS employees were never subject to WEP or GPO, because their federal service is covered by Social Security — they paid in like any private-sector worker. The repeal is most meaningful for those with non-covered (CSRS) service. If your career mixed covered and non-covered service, the change may still help you.',
      },
      { type: 'h2', text: 'What to do now' },
      {
        type: 'ol',
        items: [
          'If you previously did not file for a spousal or survivor benefit because GPO would have wiped it out, revisit that decision — it may now be payable.',
          'Check your Social Security statement and benefit amount for the recalculation.',
          'Coordinate the (possibly higher) Social Security benefit with your pension and TSP withdrawal plan.',
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Estimate your Social Security with the <A href="/ss">Social Security estimator</A> and see it
            alongside your pension in the <A href="/full">full analysis</A>.
          </>
        ),
      },
      {
        type: 'faq',
        items: [
          {
            q: 'Are WEP and GPO really gone?',
            a: 'Yes. The Social Security Fairness Act repealed both provisions. The SSA has been adjusting affected benefits, including retroactive payments for benefits payable after the effective date.',
          },
          {
            q: 'Do I need to reapply for benefits?',
            a: 'The SSA has processed many adjustments automatically, but if you never applied for a spousal or survivor benefit because of GPO, you may need to file now. Check with the SSA.',
          },
          {
            q: 'Did this affect FERS employees?',
            a: 'Generally not directly, because FERS service is Social Security-covered. The repeal mainly helps those with non-covered CSRS service.',
          },
        ],
      },
      {
        type: 'p',
        text: (
          <>
            Authoritative reference: <A href={SSA}>SSA.gov</A>. For the latest guidance and your specific
            adjustment, contact the Social Security Administration directly. This site is not affiliated
            with the U.S. government.
          </>
        ),
      },
    ],
  },
};
