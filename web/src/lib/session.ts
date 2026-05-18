const MY_POLLS_KEY = 'whenly_my_polls'

export function getMyPollIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(MY_POLLS_KEY) || '[]')
  } catch {
    return []
  }
}

export function addMyPoll(pollId: string) {
  const ids = getMyPollIds()
  if (!ids.includes(pollId)) {
    ids.unshift(pollId)
    localStorage.setItem(MY_POLLS_KEY, JSON.stringify(ids))
  }
}

export function removeMyPoll(pollId: string) {
  const ids = getMyPollIds().filter(id => id !== pollId)
  localStorage.setItem(MY_POLLS_KEY, JSON.stringify(ids))
}
