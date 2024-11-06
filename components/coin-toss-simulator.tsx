'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Loader } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'

const CoinIcon = React.memo(({ toss }: { toss: string }) => (
  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold ${toss === '正' ? 'bg-blue-500' : 'bg-red-500'}`}>{toss}</span>
))

CoinIcon.displayName = 'CoinIcon'

const VirtualizedCoinGrid = ({ sequence }: { sequence: string[] }) => {
  const parentRef = React.useRef<HTMLDivElement>(null)
  const COINS_PER_ROW = 10

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(sequence.length / COINS_PER_ROW),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  })

  return (
    <div ref={parentRef} className='h-[200px] p-2 overflow-auto border border-gray-200 rounded-md'>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
            className='flex justify-center gap-2'
          >
            {sequence.slice(virtualRow.index * COINS_PER_ROW, (virtualRow.index + 1) * COINS_PER_ROW).map((toss, index) => (
              <CoinIcon key={virtualRow.index * COINS_PER_ROW + index} toss={toss} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CoinTossSimulator() {
  const [tosses, setTosses] = useState(100)
  const [results, setResults] = useState<{ heads: number; tails: number; sequence: string[] } | null>(null)
  const [showSequence, setShowSequence] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setResults(null)
  }, [tosses])

  const simulateTosses = async () => {
    setIsLoading(true)
    setResults(null)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    let heads = 0
    let tails = 0
    const sequence = []

    for (let i = 0; i < tosses; i++) {
      if (Math.random() < 0.5) {
        heads++
        sequence.push('正')
      } else {
        tails++
        sequence.push('反')
      }
    }

    setResults({ heads, tails, sequence })
    setIsLoading(false)
  }

  const percentages = useMemo(() => {
    if (!results) return { heads: 0, tails: 0 }
    return {
      heads: (results.heads / tosses) * 100,
      tails: (results.tails / tosses) * 100,
    }
  }, [results, tosses])

  return (
    <div className='max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg'>
      <h1 className='text-2xl font-bold mb-6 text-center'>硬币抛掷模拟器</h1>

      <div className='mb-4'>
        <Label htmlFor='tosses'>抛掷次数</Label>
        <Input
          id='tosses'
          type='number'
          value={tosses === 0 ? '' : tosses.toString()}
          onChange={(e) => {
            const value = e.target.value
            const trimmedValue = value.replace(/^0+/, '')

            if (trimmedValue === '') {
              setTosses(0)
            } else {
              const parsedValue = parseInt(trimmedValue, 10)
              setTosses(isNaN(parsedValue) ? 0 : parsedValue)
            }
          }}
          min='0'
        />
      </div>

      <div className='flex items-center space-x-2 mb-4'>
        <Switch id='show-sequence' checked={showSequence} onCheckedChange={setShowSequence} />
        <Label htmlFor='show-sequence'>显示抛掷序列</Label>
      </div>

      <Button onClick={simulateTosses} className='w-full mb-4' disabled={tosses === 0 || isLoading}>
        {isLoading ? (
          <>
            <Loader className='mr-2 h-4 w-4 animate-spin' />
            模拟中...
          </>
        ) : (
          '模拟抛掷'
        )}
      </Button>

      {results && (
        <div className='mt-4'>
          <h2 className='text-xl font-semibold mb-2'>结果统计：</h2>
          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div className='bg-blue-100 p-4 rounded-md'>
              <h3 className='text-lg font-semibold mb-2 text-blue-700'>正面</h3>
              <p className='text-2xl font-bold text-blue-600'>{results.heads}</p>
              <p className='text-sm text-blue-600'>{percentages.heads.toFixed(2)}%</p>
              <Progress value={percentages.heads} className='h-2 mt-2' />
            </div>
            <div className='bg-red-100 p-4 rounded-md'>
              <h3 className='text-lg font-semibold mb-2 text-red-700'>反面</h3>
              <p className='text-2xl font-bold text-red-600'>{results.tails}</p>
              <p className='text-sm text-red-600'>{percentages.tails.toFixed(2)}%</p>
              <Progress value={percentages.tails} className='h-2 mt-2' />
            </div>
          </div>

          {showSequence && (
            <div className='mt-4'>
              <h3 className='text-lg font-semibold mb-2'>抛掷序列：</h3>
              <VirtualizedCoinGrid sequence={results.sequence} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
