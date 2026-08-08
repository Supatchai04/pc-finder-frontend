const wait = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))

const getMockRole = () => (import.meta.env.VITE_MOCK_ROLE || 'USER').toUpperCase()

const mockUser = () => ({
  userId: 1,
  email: 'student_name@mail.rmutk.ac.th',
  name: 'PC Finder Demo User',
  profilePicture: 'https://ui-avatars.com/api/?name=PC+Finder&background=0D6EFD&color=fff',
  role: getMockRole(),
})

export async function mockGoogleLogin() {
  await wait()
  return {
    status: 'success',
    message: 'เข้าสู่ระบบสำเร็จ',
    data: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: mockUser(),
    },
  }
}

export async function mockCurrentUser() {
  await wait(250)
  return {
    status: 'success',
    message: 'ดึงข้อมูลสำเร็จ',
    data: { user: mockUser() },
  }
}

export async function mockRefreshToken() {
  await wait(250)
  return {
    status: 'success',
    message: 'ต่ออายุ Token สำเร็จ',
    data: { accessToken: `mock-access-token-${Date.now()}` },
  }
}

export async function mockLogout() {
  await wait(200)
  return { status: 'success', message: 'ออกจากระบบสำเร็จ' }
}
