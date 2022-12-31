declare var sa_event:any
export const trackEvent = (label:string) => {
  sa_event(label)
}