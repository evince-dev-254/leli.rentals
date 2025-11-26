"use client"

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/components/auth-provider'
import { onboardingService, UserOnboardingData } from '@/lib/onboarding-service'

export interface OnboardingState {
  data: UserOnboardingData | null
  isLoading: boolean
  error: string | null
  progress: {
    completed: boolean
    currentStep: number
    totalSteps: number
    progress: number
  }
}

export const useOnboarding = () => {
  const { user } = useAuthContext()
  const [state, setState] = useState<OnboardingState>({
    data: null,
    isLoading: true,
    error: null,
    progress: {
      completed: false,
      currentStep: 1,
      totalSteps: 5,
      progress: 0
    }
  })

  useEffect(() => {
    if (user) {
      loadOnboardingData()
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [user])

  const loadOnboardingData = async () => {
    if (!user) return

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const [data, progress] = await Promise.all([
        onboardingService.getOnboardingData(user.id),
        onboardingService.getOnboardingProgress(user.id)
      ])

      setState(prev => ({
        ...prev,
        data,
        progress,
        isLoading: false
      }))
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }))
    }
  }

  const saveOnboardingData = async (data: Partial<UserOnboardingData>) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      await onboardingService.saveOnboardingData(user.id, data)
      
      // Reload data after saving
      await loadOnboardingData()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const completeOnboarding = async (finalData: Partial<UserOnboardingData>) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      await onboardingService.completeOnboarding(user.id, finalData)
      
      // Reload data after completion
      await loadOnboardingData()
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const hasCompletedOnboarding = () => {
    return state.progress.completed
  }

  const getCurrentStep = () => {
    return state.progress.currentStep
  }

  const getProgressPercentage = () => {
    return state.progress.progress
  }

  return {
    ...state,
    saveOnboardingData,
    completeOnboarding,
    hasCompletedOnboarding,
    getCurrentStep,
    getProgressPercentage,
    refetch: loadOnboardingData
  }
}

export default useOnboarding
