import { Interact } from '../../store/interact'
import download from '../download/download'

let _fallback = (service, title, url) => {
  let launchURL = ''
  let _title = encodeURIComponent(title)
  let _url = encodeURIComponent(url)
  switch (service) {
    case 'twitter':
      launchURL = `https://twitter.com/intent/tweet?url=${_url}&text=${_title}&via=nomieapp&hashtags=quantifedself`
      break
    case 'facebook':
      launchURL = `https://www.facebook.com/sharer.php?u=${_url}`
      break
    case 'linkedin':
      launchURL = `https://www.linkedin.com/shareArticle?mini=true&url=${_url}&title=${_title}&summary=&source=nomie.app`
      break
    case 'reddit':
      launchURL = `https://reddit.com/submit?url=${_url}&title=${_title}`
      break
    case 'email':
      launchURL = `mailto:?subject=Check%20out%20Nomie&body=${_title}%0A%0A${url}`
      break
  }
  if (launchURL) {
    window.open(launchURL, '_system')
  }
}

export default (title:string, url?:string, file?:File) => {
  let buttons = [
    {
      title: 'Twitter',
      click() {
        _fallback('twitter', title, url)
      },
    },
    {
      title: 'Facebook',
      click() {
        _fallback('facebook', title, url)
      },
    },
    {
      title: 'LinkedIn',
      click() {
        _fallback('linkedin', title, url)
      },
    },
    {
      title: 'Reddit',
      click() {
        _fallback('reddit', title, url)
      },
    },
    {
      title: 'Email',
      click() {
        _fallback('email', title, url)
      },
    },
  ]
  if (navigator.share) {
    if(url) {
      return navigator.share({
        title: title,
        url: url,
      })
    } else if(file) {
      let fileArray = [file];
      navigator.share({
        files: fileArray,
        title: title,
      });
    }
  } else if(url && !file) {
    Interact.popmenu({ id: 'share', buttons: buttons })
  } else if(file) {
    download.file(file);
  }
  return Promise.resolve(null)
}
