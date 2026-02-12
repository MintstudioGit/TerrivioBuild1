import svgPaths from "./svg-hwkujgrpqn";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[36px] tracking-[-0.9px] w-[232.43px]">
        <p className="leading-[40px] whitespace-pre-wrap">Saved Prompts</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[18px] w-[493.68px]">
        <p className="leading-[28px] whitespace-pre-wrap">Your curated collection of prompts. Ready to be used anytime.</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Container1 />
    </div>
  );
}

function Container4() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-[2px] pt-px relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#9ca3af] text-[14px] w-[150.73px]">
          <p className="leading-[normal] whitespace-pre-wrap">Search saved prompts...</p>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center pl-[41px] pr-[17px] py-[11.5px] relative size-full">
          <Container4 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16.0023">
        <g id="SVG">
          <path d={svgPaths.p3f4b2700} fill="var(--fill-0, #A3A3A3)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bottom-[30%] content-stretch flex flex-col items-start left-[12px] top-[30%]" data-name="Container">
      <Svg />
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start max-w-[384px] min-h-px min-w-px relative" data-name="Container">
      <Input />
      <Container5 />
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#262626] text-[14px] text-center w-[38.08px]">
          <p className="leading-[20px] whitespace-pre-wrap">Model</p>
        </div>
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="SVG">
          <path d={svgPaths.p3c672480} fill="var(--fill-0, #737373)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container8() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Svg1 />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] h-[40px] items-center px-[17px] py-px relative rounded-[6px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Container7 />
      <Container8 />
    </div>
  );
}

function Container9() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#262626] text-[14px] text-center w-[56.56px]">
          <p className="leading-[20px] whitespace-pre-wrap">Category</p>
        </div>
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="SVG">
          <path d={svgPaths.p3c672480} fill="var(--fill-0, #737373)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container10() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Svg2 />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] h-[40px] items-center px-[17px] py-px relative rounded-[6px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Container9 />
      <Container10 />
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#262626] text-[14px] text-center w-[149.17px]">
          <p className="leading-[20px] whitespace-pre-wrap">Sort by: Recently Saved</p>
        </div>
      </div>
    </div>
  );
}

function Svg3() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="SVG">
          <path d={svgPaths.p3c672480} fill="var(--fill-0, #737373)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container12() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Svg3 />
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] h-[40px] items-center px-[17px] py-px relative rounded-[6px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Container11 />
      <Container12 />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Container6 />
    </div>
  );
}

function Svg4() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="SVG">
          <path d={svgPaths.p36fa2c80} fill="var(--fill-0, #404040)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg4 />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex gap-[8px] items-center px-[10px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Background">
      <Container15 />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#404040] text-[12px] w-[89.17px]">
        <p className="leading-[16px] whitespace-pre-wrap">High-Conversion</p>
      </div>
    </div>
  );
}

function Svg5() {
  return (
    <div className="h-[12px] relative shrink-0 w-[13.5px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 12.0013">
        <g id="SVG">
          <path d={svgPaths.p20cb6290} fill="var(--fill-0, #A3A3A3)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg5 />
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[12px] w-[16.69px]">
        <p className="leading-[16px] whitespace-pre-wrap">4.9</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container17 />
      <Container18 />
    </div>
  );
}

function Container14() {
  return (
    <div className="relative shrink-0 w-[400.66px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Background />
        <Container16 />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="relative shrink-0 w-[400.66px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[16px] w-[265px]">
          <p className="leading-[24px] whitespace-pre-wrap">Cold Outreach: SaaS Decision Maker</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start px-[9px] py-[5px] relative rounded-[6px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[12px] w-[34.27px]">
        <p className="leading-[16px] whitespace-pre-wrap">GPT-4</p>
      </div>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start px-[9px] py-[5px] relative rounded-[6px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[12px] w-[22.69px]">
        <p className="leading-[16px] whitespace-pre-wrap">B2B</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute bottom-0 content-stretch flex gap-[8px] items-center left-0" data-name="Container">
      <BackgroundBorder />
      <BackgroundBorder1 />
    </div>
  );
}

function Svg6() {
  return (
    <div className="h-[18px] relative shrink-0 w-[13.5px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 18">
        <g id="SVG">
          <path d={svgPaths.p3850e1c0} fill="var(--fill-0, #171717)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex items-start pb-[2.75px] pt-[0.25px] relative shrink-0" data-name="Container">
      <Svg6 />
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bottom-[-2.75px] content-stretch flex flex-col items-center justify-center left-[387.16px]" data-name="Button">
      <Container21 />
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[26px] relative shrink-0 w-[400.66px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container20 />
        <Button3 />
      </div>
    </div>
  );
}

function PromptCard() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 p-[21px] right-[933.34px] rounded-[8px] top-0" data-name="Prompt Card 1">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Container14 />
      <Heading1 />
      <Container19 />
    </div>
  );
}

function Svg7() {
  return (
    <div className="h-[12px] relative shrink-0 w-[15px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 12.0025">
        <g id="SVG">
          <path d={svgPaths.p383f000} fill="var(--fill-0, #404040)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg7 />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex gap-[8px] items-center px-[10px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Background">
      <Container23 />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#404040] text-[12px] w-[63.27px]">
        <p className="leading-[16px] whitespace-pre-wrap">Clean Code</p>
      </div>
    </div>
  );
}

function Svg8() {
  return (
    <div className="h-[12px] relative shrink-0 w-[13.5px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 12.0013">
        <g id="SVG">
          <path d={svgPaths.p20cb6290} fill="var(--fill-0, #A3A3A3)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg8 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[12px] w-[16.69px]">
        <p className="leading-[16px] whitespace-pre-wrap">4.9</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container25 />
      <Container26 />
    </div>
  );
}

function Container22() {
  return (
    <div className="relative shrink-0 w-[400.67px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Background1 />
        <Container24 />
      </div>
    </div>
  );
}

function Heading2() {
  return (
    <div className="relative shrink-0 w-[400.67px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[16px] w-[226.89px]">
          <p className="leading-[24px] whitespace-pre-wrap">Code: React Component Expert</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start px-[9px] py-[5px] relative rounded-[6px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[12px] w-[34.27px]">
        <p className="leading-[16px] whitespace-pre-wrap">GPT-4</p>
      </div>
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start px-[9px] py-[5px] relative rounded-[6px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[12px] w-[64.05px]">
        <p className="leading-[16px] whitespace-pre-wrap">Engineering</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute bottom-0 content-stretch flex gap-[7.99px] items-center left-0" data-name="Container">
      <BackgroundBorder2 />
      <BackgroundBorder3 />
    </div>
  );
}

function Svg9() {
  return (
    <div className="h-[18px] relative shrink-0 w-[13.5px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 18">
        <g id="SVG">
          <path d={svgPaths.p3850e1c0} fill="var(--fill-0, #171717)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex items-start pb-[2.75px] pt-[0.25px] relative shrink-0" data-name="Container">
      <Svg9 />
    </div>
  );
}

function Button4() {
  return (
    <div className="absolute bottom-[-2.75px] content-stretch flex flex-col items-center justify-center left-[387.17px]" data-name="Button">
      <Container29 />
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[26px] relative shrink-0 w-[400.67px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container28 />
        <Button4 />
      </div>
    </div>
  );
}

function PromptCard1() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-[466.66px] p-[21px] right-[466.67px] rounded-[8px] top-0" data-name="Prompt Card 2">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Container22 />
      <Heading2 />
      <Container27 />
    </div>
  );
}

function Svg10() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="SVG">
          <path d={svgPaths.p38e89c00} fill="var(--fill-0, #404040)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg10 />
    </div>
  );
}

function Background2() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex gap-[8px] items-center px-[10px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Background">
      <Container31 />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#404040] text-[12px] w-[83.2px]">
        <p className="leading-[16px] whitespace-pre-wrap">SEO-Optimized</p>
      </div>
    </div>
  );
}

function Svg11() {
  return (
    <div className="h-[12px] relative shrink-0 w-[13.5px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 12.0013">
        <g id="SVG">
          <path d={svgPaths.p20cb6290} fill="var(--fill-0, #A3A3A3)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg11 />
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[12px] w-[16.69px]">
        <p className="leading-[16px] whitespace-pre-wrap">4.8</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container33 />
      <Container34 />
    </div>
  );
}

function Container30() {
  return (
    <div className="relative shrink-0 w-[400.66px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Background2 />
        <Container32 />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="relative shrink-0 w-[400.66px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[16px] w-[183.8px]">
          <p className="leading-[24px] whitespace-pre-wrap">SEO: Blog Outline Builder</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder4() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start px-[9px] py-[5px] relative rounded-[6px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[12px] w-[62.75px]">
        <p className="leading-[16px] whitespace-pre-wrap">UX Pilot 3.5</p>
      </div>
    </div>
  );
}

function BackgroundBorder5() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start px-[9px] py-[5px] relative rounded-[6px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[12px] w-[97.5px]">
        <p className="leading-[16px] whitespace-pre-wrap">Content Marketing</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute bottom-0 content-stretch flex gap-[8px] items-center left-0" data-name="Container">
      <BackgroundBorder4 />
      <BackgroundBorder5 />
    </div>
  );
}

function Svg12() {
  return (
    <div className="h-[18px] relative shrink-0 w-[13.5px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 18">
        <g id="SVG">
          <path d={svgPaths.p3850e1c0} fill="var(--fill-0, #171717)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex items-start pb-[2.75px] pt-[0.25px] relative shrink-0" data-name="Container">
      <Svg12 />
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute bottom-[-2.75px] content-stretch flex flex-col items-center justify-center left-[387.15px]" data-name="Button">
      <Container37 />
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[26px] relative shrink-0 w-[400.66px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container36 />
        <Button5 />
      </div>
    </div>
  );
}

function PromptCard2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-[933.33px] p-[21px] right-[0.01px] rounded-[8px] top-0" data-name="Prompt Card 3">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Container30 />
      <Heading3 />
      <Container35 />
    </div>
  );
}

function Svg13() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="SVG">
          <path d={svgPaths.p115e07d0} fill="var(--fill-0, #404040)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container39() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg13 />
    </div>
  );
}

function Background3() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex gap-[8px] items-center px-[10px] py-[4px] relative rounded-[9999px] shrink-0" data-name="Background">
      <Container39 />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#404040] text-[12px] w-[50.91px]">
        <p className="leading-[16px] whitespace-pre-wrap">Retention</p>
      </div>
    </div>
  );
}

function Svg14() {
  return (
    <div className="h-[12px] relative shrink-0 w-[13.5px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 12.0013">
        <g id="SVG">
          <path d={svgPaths.p20cb6290} fill="var(--fill-0, #A3A3A3)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <Svg14 />
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[12px] w-[16.69px]">
        <p className="leading-[16px] whitespace-pre-wrap">4.7</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0" data-name="Container">
      <Container41 />
      <Container42 />
    </div>
  );
}

function Container38() {
  return (
    <div className="relative shrink-0 w-[400.66px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between relative w-full">
        <Background3 />
        <Container40 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="relative shrink-0 w-[400.66px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[24px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[16px] w-[222.86px]">
          <p className="leading-[24px] whitespace-pre-wrap">Re-engagement: Churned User</p>
        </div>
      </div>
    </div>
  );
}

function BackgroundBorder6() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start px-[9px] py-[5px] relative rounded-[6px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[12px] w-[34.27px]">
        <p className="leading-[16px] whitespace-pre-wrap">GPT-4</p>
      </div>
    </div>
  );
}

function BackgroundBorder7() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start px-[9px] py-[5px] relative rounded-[6px] shrink-0" data-name="Background+Border">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[12px] w-[50.06px]">
        <p className="leading-[16px] whitespace-pre-wrap">Win-back</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="absolute bottom-0 content-stretch flex gap-[8px] items-center left-0" data-name="Container">
      <BackgroundBorder6 />
      <BackgroundBorder7 />
    </div>
  );
}

function Svg15() {
  return (
    <div className="h-[18px] relative shrink-0 w-[13.5px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 18">
        <g id="SVG">
          <path d={svgPaths.p3850e1c0} fill="var(--fill-0, #171717)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex items-start pb-[2.75px] pt-[0.25px] relative shrink-0" data-name="Container">
      <Svg15 />
    </div>
  );
}

function Button6() {
  return (
    <div className="absolute bottom-[-2.75px] content-stretch flex flex-col items-center justify-center left-[387.16px]" data-name="Button">
      <Container45 />
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[26px] relative shrink-0 w-[400.66px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container44 />
        <Button6 />
      </div>
    </div>
  );
}

function PromptCard3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 p-[21px] right-[933.34px] rounded-[8px] top-[172px]" data-name="Prompt Card 4">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <Container38 />
      <Heading4 />
      <Container43 />
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[320px] relative shrink-0 w-full" data-name="Container">
      <PromptCard />
      <PromptCard1 />
      <PromptCard2 />
      <PromptCard3 />
    </div>
  );
}

export default function Main() {
  return (
    <div className="content-stretch flex flex-col gap-[32px] items-start px-[32px] py-[48px] relative size-full" data-name="Main">
      <Container />
      <Container2 />
      <Container13 />
    </div>
  );
}