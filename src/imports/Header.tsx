function Background() {
  return (
    <div className="bg-[#171717] content-stretch flex items-center justify-center relative rounded-[6px] shrink-0 size-[32px]" data-name="Background">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white w-[18.25px]">
        <p className="leading-[20px] whitespace-pre-wrap">PV</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[18px] w-[97.86px]">
        <p className="leading-[28px] whitespace-pre-wrap">PromptVault</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0 w-[153px]" data-name="Container">
      <Background />
      <Container3 />
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex flex-col items-start px-[12px] py-[8px] relative rounded-[6px] shrink-0" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[14px] w-[56.14px]">
        <p className="leading-[20px] whitespace-pre-wrap">Directory</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start px-[12px] py-[8px] relative rounded-[6px] shrink-0" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[14px] w-[94.94px]">
        <p className="leading-[20px] whitespace-pre-wrap">Saved Prompts</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col items-start px-[12px] py-[8px] relative rounded-[6px] shrink-0" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#525252] text-[14px] w-[42.81px]">
        <p className="leading-[20px] whitespace-pre-wrap">Pricing</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="content-stretch flex gap-[4px] h-full items-center justify-center relative shrink-0 w-[987px]" data-name="Nav">
      <Link />
      <Link1 />
      <Link2 />
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-center justify-center min-h-px min-w-px relative" data-name="Container">
      <Container2 />
      <div className="flex flex-row items-center self-stretch">
        <Nav />
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="bg-[#f5f5f5] content-stretch flex flex-col items-start px-[16px] py-[8px] relative rounded-[6px] shrink-0" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#171717] text-[14px] w-[43.53px]">
        <p className="leading-[20px] whitespace-pre-wrap">Sign In</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <div className="bg-[#171717] content-stretch flex flex-col items-start px-[16px] py-[8px] relative rounded-[6px] shrink-0" data-name="Link">
      <div className="flex flex-col font-['Nimbus_Sans:Regular',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-white w-[96.03px]">
        <p className="leading-[20px] whitespace-pre-wrap">Create Account</p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Link3 />
      <Link4 />
    </div>
  );
}

function Container() {
  return (
    <div className="h-[64px] max-w-[1440px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between max-w-[inherit] px-[32px] relative size-full">
          <Container1 />
          <Container4 />
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start pb-px relative size-full" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#e5e5e5] border-b border-solid inset-0 pointer-events-none" />
      <Container />
    </div>
  );
}