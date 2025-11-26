'use client'

import { ReactNode } from 'react'

interface ApolloWrapperProps {
  children: ReactNode
}

// Apollo Client is not currently set up in this project
// This component is kept for future use
export function ApolloWrapper({ children }: ApolloWrapperProps) {
  // Return children without Apollo wrapper
  // To enable Apollo, install @apollo/client and create graphql-client.ts
  return <>{children}</>
}
