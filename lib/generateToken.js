import { wordlist } from './wordlist'

export function generateToken(wordCount = 3) {
  let result = []
  for (let i = 0; i < wordCount; i++) {
    const rand = Math.floor(Math.random() * wordlist.length)
    result.push(wordlist[rand])
  }
  return result.join('-')
}