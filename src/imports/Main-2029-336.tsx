import svgPaths from "./svg-90omvwj8jf";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[48px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[48px] text-center tracking-[-2.4px] w-[942.78px]">
        <p className="leading-[48px] whitespace-pre-wrap">Unlock every prompt. Supercharge your workflow.</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[672px] relative shrink-0 w-[672px]" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[56px] justify-center leading-[28px] not-italic relative shrink-0 text-[#525252] text-[18px] text-center w-[622.6px] whitespace-pre-wrap">
        <p className="mb-0">Get unlimited access to our entire library of 1,200+ battle-tested prompts. Stop</p>
        <p>guessing and start generating revenue-driving results instantly.</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-[#171717] content-stretch flex h-[48px] items-center justify-center max-w-[320px] relative rounded-[8px] shrink-0 w-[320px]" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white w-[121.75px]">
        <p className="leading-[24px] whitespace-pre-wrap">Start your €9 trial</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[14px] text-center w-[312.72px]">
        <p className="leading-[20px] whitespace-pre-wrap">7-day trial for €9, then €29/month. Cancel anytime.</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center justify-center pt-[16px] relative shrink-0 w-full" data-name="Container">
      <Link />
      <Container2 />
    </div>
  );
}

function Section() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[380px] items-center py-[80px] relative shrink-0 w-full" data-name="Section">
      <Heading />
      <Container />
      <Container1 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[30px] tracking-[-0.75px] w-[388.57px]">
        <p className="leading-[36px] whitespace-pre-wrap">{`What's included in the Pro plan`}</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[16px] w-[425.62px]">
        <p className="leading-[24px] whitespace-pre-wrap">Everything you need to level up your AI-powered operations.</p>
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="h-[16px] relative shrink-0 w-[14px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.0023 16">
        <g id="SVG">
          <path d={svgPaths.p246d72c0} fill="var(--fill-0, #171717)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-name="Margin">
      <Svg />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[16px] w-[176.39px]">
        <p className="leading-[24px] whitespace-pre-wrap">Unlimited Prompt Copies</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[40px] justify-center leading-[20px] not-italic relative shrink-0 text-[#525252] text-[14px] w-[490.45px] whitespace-pre-wrap">
        <p className="mb-0">Copy and use any of our 1,200+ prompts without restriction. The paywall on the</p>
        <p>{`"Copy" button is removed.`}</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container6 />
      <Container7 />
    </div>
  );
}

function Item() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Item">
      <Margin />
      <Container5 />
    </div>
  );
}

function Svg1() {
  return (
    <div className="h-[16px] relative shrink-0 w-[14px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.0023 16">
        <g id="SVG">
          <path d={svgPaths.p246d72c0} fill="var(--fill-0, #171717)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-name="Margin">
      <Svg1 />
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[16px] w-[170.34px]">
        <p className="leading-[24px] whitespace-pre-wrap">Unlimited Prompt Saves</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[40px] justify-center leading-[20px] not-italic relative shrink-0 text-[#525252] text-[14px] w-[493.77px] whitespace-pre-wrap">
        <p className="mb-0">{`Build your personal library of go-to prompts. The paywall on the "Save" button is`}</p>
        <p>removed.</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container9 />
      <Container10 />
    </div>
  );
}

function Item1() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Item">
      <Margin1 />
      <Container8 />
    </div>
  );
}

function Svg2() {
  return (
    <div className="h-[16px] relative shrink-0 w-[14px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.0023 16">
        <g id="SVG">
          <path d={svgPaths.p246d72c0} fill="var(--fill-0, #171717)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-name="Margin">
      <Svg2 />
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[16px] w-[226.08px]">
        <p className="leading-[24px] whitespace-pre-wrap">{`Access All Models & Categories`}</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[40px] justify-center leading-[20px] not-italic relative shrink-0 text-[#525252] text-[14px] w-[471.7px] whitespace-pre-wrap">
        <p className="mb-0">From GPT-4 to UX Pilot 3.5, access prompts for every major model and use-</p>
        <p>case.</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container12 />
      <Container13 />
    </div>
  );
}

function Item2() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Item">
      <Margin2 />
      <Container11 />
    </div>
  );
}

function Svg3() {
  return (
    <div className="h-[16px] relative shrink-0 w-[14px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.0023 16">
        <g id="SVG">
          <path d={svgPaths.p246d72c0} fill="var(--fill-0, #171717)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[4px] relative shrink-0" data-name="Margin">
      <Svg3 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[16px] w-[255.56px]">
        <p className="leading-[24px] whitespace-pre-wrap">Verified, High-Performance Prompts</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[40px] justify-center leading-[20px] not-italic relative shrink-0 text-[#525252] text-[14px] w-[453.23px] whitespace-pre-wrap">
        <p className="mb-0">Our prompts are tested and rated by the community to ensure quality and</p>
        <p>effectiveness.</p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Container15 />
      <Container16 />
    </div>
  );
}

function Item3() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="Item">
      <Margin3 />
      <Container14 />
    </div>
  );
}

function List() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start pt-[24px] relative shrink-0 w-full" data-name="List">
      <Item />
      <Item1 />
      <Item2 />
      <Item3 />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative self-stretch shrink-0 w-[524.8px]" data-name="Container">
      <Heading1 />
      <Container4 />
      <List />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[25px] right-[25px] top-[25px]" data-name="Heading 3">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[18px] w-[68.56px]">
        <p className="leading-[28px] whitespace-pre-wrap">Pro Plan</p>
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute font-['Nimbus_Sans:Regular',sans-serif] h-[40px] leading-[0] left-[25px] not-italic right-[25px] top-[69px]" data-name="Paragraph">
      <div className="-translate-y-1/2 absolute flex flex-col h-[40px] justify-center left-0 text-[#171717] text-[36px] top-[20px] tracking-[-0.9px] w-[57.36px]">
        <p className="leading-[40px] whitespace-pre-wrap">€29</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col h-[24px] justify-center left-[61.81px] text-[#525252] text-[16px] top-[24px] w-[53.27px]">
        <p className="leading-[24px] whitespace-pre-wrap">/ month</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[25px] right-[25px] top-[113px]" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[14px] w-[205.39px]">
        <p className="leading-[20px] whitespace-pre-wrap">Billed after your 7-day trial for €9.</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="absolute bg-[#171717] content-stretch flex h-[44px] items-center justify-center left-[25px] right-[25px] rounded-[8px] top-[157px]" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white w-[121.75px]">
        <p className="leading-[24px] whitespace-pre-wrap">Start your €9 trial</p>
      </div>
    </div>
  );
}

function Svg4() {
  return (
    <div className="h-[24px] relative shrink-0 w-[27px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 24">
        <g id="SVG">
          <path d={svgPaths.p237a7c80} fill="var(--fill-0, #737373)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <Svg4 />
    </div>
  );
}

function Svg5() {
  return (
    <div className="h-[24px] relative shrink-0 w-[27px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 24">
        <g id="SVG">
          <path d={svgPaths.p1010ba00} fill="var(--fill-0, #737373)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <Svg5 />
    </div>
  );
}

function Svg6() {
  return (
    <div className="h-[24px] relative shrink-0 w-[27px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 24">
        <g id="SVG">
          <path d={svgPaths.p1428c700} fill="var(--fill-0, #737373)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <Svg6 />
    </div>
  );
}

function Svg7() {
  return (
    <div className="h-[24px] relative shrink-0 w-[30px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 24">
        <g id="SVG">
          <path d={svgPaths.p1d616700} fill="var(--fill-0, #737373)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <Svg7 />
    </div>
  );
}

function Svg8() {
  return (
    <div className="h-[24px] relative shrink-0 w-[30px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30.0025 24">
        <g id="SVG">
          <path d={svgPaths.p16fecd00} fill="var(--fill-0, #737373)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <Svg8 />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute content-stretch flex gap-[16px] items-start justify-center left-[25px] right-[25px] top-[225px]" data-name="Container">
      <Container20 />
      <Container21 />
      <Container22 />
      <Container23 />
      <Container24 />
    </div>
  );
}

function Border() {
  return (
    <div className="h-[274px] relative rounded-[8px] shrink-0 w-full" data-name="Border">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Heading2 />
      <Paragraph />
      <Container18 />
      <Link1 />
      <Container19 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0 w-[339.2px]" data-name="Container">
      <Border />
    </div>
  );
}

function Section1() {
  return (
    <div className="content-stretch flex gap-[32px] items-start justify-center max-w-[896px] relative shrink-0 w-[896px]" data-name="Section">
      <Container3 />
      <Container17 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[30px] text-center tracking-[-0.75px] w-[527.92px]">
        <p className="leading-[36px] whitespace-pre-wrap">Trusted by professionals at top companies</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[20px] w-[104.06px]">
        <p className="leading-[28px] whitespace-pre-wrap">Company A</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container27 />
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[20px] w-[83.73px]">
        <p className="leading-[28px] whitespace-pre-wrap">Startup B</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container29 />
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[20px] w-[86.25px]">
        <p className="leading-[28px] whitespace-pre-wrap">Agency C</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container31 />
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[20px] w-[111.03px]">
        <p className="leading-[28px] whitespace-pre-wrap">Enterprise D</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container33 />
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[20px] w-[75.45px]">
        <p className="leading-[28px] whitespace-pre-wrap">Studio E</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container35 />
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[20px] w-[66.91px]">
        <p className="leading-[28px] whitespace-pre-wrap">Team F</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-[1_0_0] items-center justify-center min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container37 />
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex gap-[32px] items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container26 />
      <Container28 />
      <Container30 />
      <Container32 />
      <Container34 />
      <Container36 />
    </div>
  );
}

function Section2() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[1024px] pt-[64px] relative shrink-0 w-[1024px]" data-name="Section">
      <Heading3 />
      <Container25 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[30px] text-center tracking-[-0.75px] w-[354.91px]">
        <p className="leading-[36px] whitespace-pre-wrap">Frequently Asked Questions</p>
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[18px] w-[221.26px]">
          <p className="leading-[28px] whitespace-pre-wrap">How does the €9 trial work?</p>
        </div>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[24px] not-italic relative shrink-0 text-[#525252] text-[16px] w-[706.68px] whitespace-pre-wrap">
          <p className="mb-0">{`You pay €9 to get full access to all Pro features for 7 days. If you don't cancel within that period, your`}</p>
          <p>subscription will automatically start, and you will be billed €29 for the first month.</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder1() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e5e5] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start pb-[25px] pt-[24px] relative w-full">
        <Heading5 />
        <Container38 />
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[18px] w-[525.76px]">
          <p className="leading-[28px] whitespace-pre-wrap">What happens when I try to copy or save a prompt as a free user?</p>
        </div>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[24px] not-italic relative shrink-0 text-[#525252] text-[16px] w-[747.32px] whitespace-pre-wrap">
          <p className="mb-0">{`As a free user, you can view the full content of any prompt. However, clicking the "Copy" or "Save" buttons`}</p>
          <p>will trigger a paywall modal, asking you to start a trial to unlock that functionality.</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder2() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e5e5] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start pb-[25px] pt-[24px] relative w-full">
        <Heading6 />
        <Container39 />
      </div>
    </div>
  );
}

function Heading7() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[18px] w-[276.7px]">
          <p className="leading-[28px] whitespace-pre-wrap">How can I cancel my subscription?</p>
        </div>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[24px] not-italic relative shrink-0 text-[#525252] text-[16px] w-[750.49px] whitespace-pre-wrap">
          <p className="mb-0">{`You can cancel your subscription at any time from your Account page. Simply navigate to Account > Billing`}</p>
          <p>{`and click "Cancel Subscription". Your access will continue until the end of your current billing period.`}</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder3() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e5e5] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start pb-[25px] pt-[24px] relative w-full">
        <Heading7 />
        <Container40 />
      </div>
    </div>
  );
}

function Heading8() {
  return (
    <div className="relative shrink-0 w-full" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[18px] w-[315.79px]">
          <p className="leading-[28px] whitespace-pre-wrap">What payment methods do you accept?</p>
        </div>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[24px] not-italic relative shrink-0 text-[#525252] text-[16px] w-[738.42px] whitespace-pre-wrap">
          <p className="mb-0">We accept all major credit cards (Visa, Mastercard, American Express) as well as Google Pay and Apple</p>
          <p>Pay, processed securely via Stripe.</p>
        </div>
      </div>
    </div>
  );
}

function HorizontalBorder4() {
  return (
    <div className="relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e5e5] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[8px] items-start pb-[25px] pt-[24px] relative w-full">
        <Heading8 />
        <Container41 />
      </div>
    </div>
  );
}

function HorizontalBorder() {
  return (
    <div className="content-stretch flex flex-col items-start pt-px relative shrink-0 w-full" data-name="HorizontalBorder">
      <div aria-hidden="true" className="absolute border-[#e5e5e5] border-solid border-t inset-0 pointer-events-none" />
      <HorizontalBorder1 />
      <HorizontalBorder2 />
      <HorizontalBorder3 />
      <HorizontalBorder4 />
    </div>
  );
}

function Section3() {
  return (
    <div className="content-stretch flex flex-col gap-[40px] items-start max-w-[768px] pt-[64px] relative shrink-0 w-[768px]" data-name="Section">
      <Heading4 />
      <HorizontalBorder />
    </div>
  );
}

function Heading9() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[30px] text-center tracking-[-0.75px] w-[270px]">
        <p className="leading-[36px] whitespace-pre-wrap">Ready to get started?</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[576px] relative shrink-0 w-[576px]" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[56px] justify-center leading-[28px] not-italic relative shrink-0 text-[#525252] text-[18px] text-center w-[574.55px] whitespace-pre-wrap">
        <p className="mb-0">Stop wasting time on mediocre prompts. Access the best and accelerate</p>
        <p>your workflow today.</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="bg-[#171717] content-stretch flex h-[48px] items-center justify-center max-w-[320px] relative rounded-[8px] shrink-0 w-[320px]" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[16px] text-center text-white w-[121.75px]">
        <p className="leading-[24px] whitespace-pre-wrap">Start your €9 trial</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[14px] text-center w-[165.23px]">
        <p className="leading-[20px] whitespace-pre-wrap">7-day trial, cancel anytime.</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center justify-center pt-[20px] relative shrink-0 w-full" data-name="Container">
      <Link2 />
      <Container44 />
    </div>
  );
}

function Section4() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center py-[80px] relative shrink-0 w-full" data-name="Section">
      <Heading9 />
      <Container42 />
      <Container43 />
    </div>
  );
}

export default function Main() {
  return (
    <div className="content-stretch flex flex-col gap-[64px] items-center px-[32px] relative size-full" data-name="Main">
      <Section />
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
    </div>
  );
}