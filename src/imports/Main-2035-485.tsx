import svgPaths from "./svg-38ut0vjqbn";

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 1">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[36px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[30px] text-center tracking-[-0.75px] w-[187.14px]">
        <p className="leading-[36px] whitespace-pre-wrap">Welcome back</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[48px] justify-center leading-[24px] not-italic relative shrink-0 text-[#525252] text-[16px] text-center w-[360.86px] whitespace-pre-wrap">
        <p className="mb-0">Sign in to access your saved prompts and continue</p>
        <p>where you left off.</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Container">
      <Heading />
      <Container3 />
    </div>
  );
}

function Svg() {
  return (
    <div className="h-[18px] relative shrink-0 w-[17.16px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.16 18">
        <g id="SVG">
          <path d={svgPaths.p35e3a200} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative">
        <Svg />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[14px] text-center w-[133.63px]">
          <p className="leading-[20px] whitespace-pre-wrap">Continue with Google</p>
        </div>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] h-[40px] items-center justify-center p-px relative rounded-[6px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Container4 />
      <Container5 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start px-[16px] relative shrink-0" data-name="Margin">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[16px] justify-center leading-[0] not-italic relative shrink-0 text-[#737373] text-[12px] w-[18.02px]">
        <p className="leading-[16px] whitespace-pre-wrap">OR</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex-[1_0_0] h-px min-h-px min-w-px relative" data-name="Horizontal Divider">
        <div aria-hidden="true" className="absolute border-[#e5e5e5] border-solid border-t inset-0 pointer-events-none" />
      </div>
      <Margin />
      <div className="flex-[1_0_0] h-px min-h-px min-w-px relative" data-name="Horizontal Divider">
        <div aria-hidden="true" className="absolute border-[#e5e5e5] border-solid border-t inset-0 pointer-events-none" />
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Label">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[14px] w-[88.54px]">
        <p className="leading-[20px] whitespace-pre-wrap">Email address</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-[2px] pt-px relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black w-[148.37px]">
          <p className="leading-[normal] whitespace-pre-wrap">team@promptvault.com</p>
        </div>
      </div>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center px-[13px] py-[11.5px] relative size-full">
          <Container9 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Container">
      <Label />
      <Input />
    </div>
  );
}

function LabelMargin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[6px] relative shrink-0" data-name="Label:margin">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[14px] w-[60.84px]">
        <p className="leading-[20px] whitespace-pre-wrap">Password</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[14px] w-[47.61px]">
        <p className="leading-[20px] whitespace-pre-wrap">Forgot?</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full" data-name="Container">
      <LabelMargin />
      <Link />
    </div>
  );
}

function Container12() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pb-[2px] pt-px relative rounded-[inherit] w-full">
        <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black w-[58.82px]">
          <p className="leading-[normal] whitespace-pre-wrap">••••••••••••</p>
        </div>
      </div>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-white h-[40px] relative rounded-[6px] shrink-0 w-full" data-name="Input">
      <div className="flex flex-row justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-start justify-center px-[13px] py-[11.5px] relative size-full">
          <Container12 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#d4d4d4] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <Container11 />
      <Input1 />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#171717] content-stretch flex h-[40px] items-center justify-center relative rounded-[6px] shrink-0 w-full" data-name="Button">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white w-[136.95px]">
        <p className="leading-[20px] whitespace-pre-wrap">Sign In with Password</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-white content-stretch flex h-[40px] items-center justify-center p-px relative rounded-[6px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#e5e5e5] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[14px] text-center w-[112.7px]">
        <p className="leading-[20px] whitespace-pre-wrap">Email a magic link</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-full" data-name="Container">
      <Container8 />
      <Container10 />
      <Button1 />
      <Button2 />
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex items-start justify-center mr-[-0.01px] relative shrink-0" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[14px] text-center w-[68.67px]">
        <p className="leading-[20px] whitespace-pre-wrap">Create one</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex items-start justify-center pr-[0.01px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] mr-[-0.01px] not-italic relative shrink-0 text-[#525252] text-[14px] text-center w-[150.08px]">
        <p className="leading-[20px] whitespace-pre-wrap">{`Don't have an account? `}</p>
      </div>
      <Link1 />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <Button />
      <Container6 />
      <Container7 />
      <Container13 />
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[384px] relative shrink-0 w-[384px]" data-name="Container">
      <Container1 />
    </div>
  );
}

export default function Main() {
  return (
    <div className="bg-[rgba(250,250,250,0.5)] content-stretch flex items-center justify-center relative size-full" data-name="Main">
      <Container />
    </div>
  );
}