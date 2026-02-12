import svgPaths from "./svg-kfh98fj3ff";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[20px] w-[331.25px]">
        <p className="leading-[28px] whitespace-pre-wrap">Cold Outreach: SaaS Decision Maker</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[14px] w-[64.59px]">
        <p className="whitespace-pre-wrap">
          <span className="leading-[20px]">{`For `}</span>
          <span className="font-['Nimbus_Sans:Regular',sans-serif] leading-[20px] not-italic text-[#404040]">GPT-4</span>
        </p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#404040] text-[14px] w-[76.11px]">
        <p className="leading-[20px] whitespace-pre-wrap">PromptVault</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[14px] w-[20.08px]">
        <p className="leading-[20px] whitespace-pre-wrap">{`By `}</p>
      </div>
      <Link />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <div className="bg-[#d4d4d4] rounded-[9999px] shrink-0 size-[4px]" data-name="Background" />
      <Container4 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0 w-full" data-name="Margin">
      <Container2 />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Heading />
      <Margin />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[14px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="SVG">
          <path d={svgPaths.p143b8d00} fill="var(--fill-0, #737373)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#262626] text-[14px] w-[46.75px]">
        <p className="leading-[20px] whitespace-pre-wrap">Verified</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex gap-[4px] items-center px-[10px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Background">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-center relative">
        <Container1 />
        <Background />
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="h-[16px] relative shrink-0 w-[12px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 16">
        <g id="SVG">
          <path d={svgPaths.pb0d0880} fill="var(--fill-0, #737373)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg1 />
    </div>
  );
}

function Button() {
  return (
    <div className="relative rounded-[6px] shrink-0 size-[32px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container7 />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex items-center justify-between left-0 pb-[25px] pt-[24px] px-[24px] right-0 top-0" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e5e5e5] border-b border-solid inset-0 pointer-events-none" />
      <Container />
      <Button />
    </div>
  );
}

function Code() {
  return (
    <div className="content-stretch flex flex-col font-['Liberation_Mono:Regular',sans-serif] gap-[22.5px] items-start leading-[22.75px] not-italic relative shrink-0 text-[#a3a3a3] text-[14px] whitespace-pre-wrap" data-name="Code">
      <div className="flex flex-col h-[91px] justify-center relative shrink-0 w-[806.55px]">
        <p className="mb-0"># IDENTITY</p>
        <p className="mb-0 text-[#f5f5f5]">{`You are a world-class sales development representative (SDR) specializing in cold email `}</p>
        <p className="mb-0 text-[#f5f5f5]">{`outreach to C-level executives at mid-market SaaS companies (50-500 employees). Your goal is to `}</p>
        <p className="text-[#f5f5f5]">book a 15-minute discovery call, not to sell the product.</p>
      </div>
      <div className="flex flex-col h-[46px] justify-center relative shrink-0 w-[756.13px]">
        <p className="mb-0"># TASK</p>
        <p className="text-[#f5f5f5]">Write a 3-part email sequence to a [Job Title, e.g., VP of Engineering] at [Company Name].</p>
      </div>
      <div className="flex flex-col h-[114px] justify-center relative shrink-0 w-[806.55px]">
        <p className="mb-0"># CONTEXT</p>
        <p className="mb-0 text-[#f5f5f5]">- My Product: [Your Product Name], a tool that [brief one-sentence pitch].</p>
        <p className="mb-0 text-[#f5f5f5]">{`- Key Pain Point We Solve: [Specific pain point, e.g., "reduces CI/CD build times by 40%"].`}</p>
        <p className="mb-0 text-[#f5f5f5]">{`- Prospect's Company Info: Use their recent funding round, a recent blog post, or a key hire as `}</p>
        <p className="text-[#f5f5f5]">a personalization hook.</p>
      </div>
      <div className="flex flex-col h-[160px] justify-center relative shrink-0 w-[781.34px]">
        <p className="mb-0"># EMAIL 1: The Personalized Hook</p>
        <p className="mb-0 text-[#f5f5f5]">{`- Subject: Quick question re: [Company Name]'s [Recent Event]`}</p>
        <p className="mb-0 text-[#f5f5f5]">- Body:</p>
        <p className="mb-0 text-[#f5f5f5]">{`  - Start with a genuine, specific compliment about the [Recent Event].`}</p>
        <p className="mb-0 text-[#f5f5f5]">{`  - Connect it to the pain point you solve.`}</p>
        <p className="mb-0 text-[#f5f5f5]">{`  - End with a low-friction question like, "Open to learning how we helped [Similar Company] `}</p>
        <p className="text-[#f5f5f5]">{`achieve [Result]?"`}</p>
      </div>
      <div className="flex flex-col h-[160px] justify-center relative shrink-0 w-[772.95px]">
        <p className="mb-0"># EMAIL 2: The Value-Add (3 days later)</p>
        <p className="mb-0 text-[#f5f5f5]">- Subject: Re: Quick question</p>
        <p className="mb-0 text-[#f5f5f5]">- Body:</p>
        <p className="mb-0 text-[#f5f5f5]">{`  - Briefly re-state your value prop.`}</p>
        <p className="mb-0 text-[#f5f5f5]">{`  - Share a short, valuable resource (e.g., a blog post, a case study) that addresses their `}</p>
        <p className="mb-0 text-[#f5f5f5]">likely challenges.</p>
        <p className="text-[#f5f5f5]">{`  - Ask for a 15-minute call to discuss their specific situation.`}</p>
      </div>
    </div>
  );
}

function Pre() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Pre">
      <Code />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#171717] relative rounded-[8px] shrink-0 w-full" data-name="Background">
      <div className="content-stretch flex flex-col items-start p-[24px] relative w-full">
        <Pre />
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="h-[16px] relative shrink-0 w-[12px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 16">
        <g id="SVG">
          <path d={svgPaths.p3899cc00} fill="var(--fill-0, #525252)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg2 />
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#e5e5e5] content-stretch flex items-center justify-center relative rounded-[9999px] shrink-0 size-[32px]" data-name="Background">
      <Container9 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[16px] w-[51.44px]">
        <p className="leading-[24px] whitespace-pre-wrap">Pro Tip</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[40px] justify-center leading-[20px] not-italic relative shrink-0 text-[#525252] text-[14px] w-[758.61px] whitespace-pre-wrap">
        <p className="mb-0">For maximum impact, use a tool like Clay or Hunter.io to enrich your lead data. A hyper-personalized first line that mentions</p>
        <p>{`a recent podcast appearance or a specific quote from an article can increase reply rates by over 200%. Don't be generic.`}</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="Container">
      <Heading1 />
      <Container11 />
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0 w-[814px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] items-start relative w-full">
        <Background2 />
        <Container10 />
      </div>
    </div>
  );
}

function Section() {
  return (
    <div className="bg-[#fafafa] relative rounded-[8px] shrink-0 w-full" data-name="Section">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="content-stretch flex flex-col items-start p-[17px] relative w-full">
        <Container8 />
      </div>
    </div>
  );
}

function Main() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-0 pt-[24px] px-[24px] right-0 top-[101px]" data-name="Main">
      <Background1 />
      <Section />
    </div>
  );
}

function Svg3() {
  return (
    <div className="h-[14px] relative shrink-0 w-[15.75px]" data-name="SVG">
      <div className="absolute inset-[0_0_-0.01%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.75 14.0016">
          <g id="SVG">
            <path d={svgPaths.p3b09ff00} fill="var(--fill-0, #A3A3A3)" id="Vector" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg3 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#262626] text-[14px] w-[19.47px]">
        <p className="leading-[20px] whitespace-pre-wrap">4.9</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[14px] w-[89.92px]">
        <p className="leading-[20px] whitespace-pre-wrap">(1,283 ratings)</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container14 />
      <Container15 />
      <Container16 />
    </div>
  );
}

function Svg4() {
  return (
    <div className="h-[14px] relative shrink-0 w-[10.5px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 14">
        <g id="SVG">
          <path d={svgPaths.p1a3d6f00} fill="var(--fill-0, #A3A3A3)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg4 />
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#262626] text-[14px] w-[35.03px]">
        <p className="leading-[20px] whitespace-pre-wrap">2,104</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[14px] w-[35.95px]">
        <p className="leading-[20px] whitespace-pre-wrap">saves</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container18 />
      <Container19 />
      <Container20 />
    </div>
  );
}

function Svg5() {
  return (
    <div className="h-[14px] relative shrink-0 w-[15.75px]" data-name="SVG">
      <div className="absolute inset-[0_0_0_-0.01%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.7521 14">
          <g id="SVG">
            <path d={svgPaths.p61dd298} fill="var(--fill-0, #A3A3A3)" id="Vector" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg5 />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#262626] text-[14px] w-[104.03px]">
        <p className="leading-[20px] whitespace-pre-wrap">High-Conversion</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[14px] w-[36.56px]">
        <p className="leading-[20px] whitespace-pre-wrap">signal</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Container22 />
      <Container23 />
      <Container24 />
    </div>
  );
}

function Container12() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-center relative">
        <Container13 />
        <Container17 />
        <Container21 />
      </div>
    </div>
  );
}

function Svg6() {
  return (
    <div className="absolute h-[14px] left-[21px] top-[11.75px] w-[10.5px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 14">
        <g id="SVG">
          <path d={svgPaths.p1375480} fill="var(--fill-0, #262626)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#f5f5f5] h-[42px] relative rounded-[8px] shrink-0 w-[95.64px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Svg6 />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] left-[calc(50%+9.25px)] not-italic text-[#262626] text-[14px] text-center top-1/2 w-[35.14px]">
        <p className="leading-[20px] whitespace-pre-wrap">{` Save`}</p>
      </div>
    </div>
  );
}

function Svg7() {
  return (
    <div className="absolute left-[20px] size-[14px] top-[10.75px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="SVG">
          <path d={svgPaths.p1ea7bb40} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#262626] h-[40px] relative rounded-[8px] shrink-0 w-[147.2px]" data-name="Button">
      <Svg7 />
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] left-[calc(50%+11px)] not-italic text-[14px] text-center text-white top-1/2 w-[85.2px]">
        <p className="leading-[20px] whitespace-pre-wrap">{` Copy Prompt`}</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative">
        <Button1 />
        <Button2 />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute bg-[rgba(250,250,250,0.5)] content-stretch flex items-center justify-between left-0 pb-[24px] pt-[25px] px-[24px] right-0 rounded-bl-[16px] rounded-br-[16px] top-[830.6px]" data-name="Footer">
      <div aria-hidden="true" className="absolute border-[#e5e5e5] border-solid border-t inset-0 pointer-events-none rounded-bl-[16px] rounded-br-[16px]" />
      <Container12 />
      <Container25 />
    </div>
  );
}

export default function BackgroundShadow() {
  return (
    <div className="bg-white overflow-clip relative rounded-[16px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-full" data-name="Background+Shadow">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}