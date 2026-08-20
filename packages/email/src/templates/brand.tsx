import { Img, Section } from '@react-email/components'
import { PHIGUARD_EMAIL_LOGO_URL, PHIGUARD_PRODUCT_NAME } from '@phiguard/brand/identity'

export function EmailBrandHeader() {
  return (
    <Section style={brandHeader}>
      <Img
        src={PHIGUARD_EMAIL_LOGO_URL}
        alt={PHIGUARD_PRODUCT_NAME}
        width="182"
        height="40"
        style={brandLogo}
      />
    </Section>
  )
}

const brandHeader = {
  marginBottom: '28px',
}

const brandLogo = {
  display: 'block',
  width: '182px',
  height: '40px',
}
