import BootstrapSwitchButton from 'bootstrap-switch-button-react'


type SwitchProps = {
  func: any
}

export default function ToggleSwitch({func}: SwitchProps) {

  return (

    <BootstrapSwitchButton
       checked={true}
    onlabel='POS' offlabel='NEG'
    width={100}
    onstyle="primary"
    offstyle="danger"
    onChange={(checked: boolean) => {
      if (checked===true){
	func('pos')
      } else {
	func('neg')
      }}}
      />
  )
}
