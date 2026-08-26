'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface DeleteButtonProps {
  /** What is being deleted, e.g. "project", "campaign with 3 posts" */
  entityLabel: string
  /** Optional extra context shown in the dialog body */
  description?: string
  onConfirm: () => void
}

/**
 * Ghost destructive button that requires an explicit confirmation
 * before running `onConfirm`. Prevents accidental data loss.
 */
export function DeleteButton({ entityLabel, description, onConfirm }: DeleteButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-white/10 bg-slate-900 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            Delete this {entityLabel}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            {description ?? `This cannot be undone. The ${entityLabel} will be permanently removed from your ledger.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10 bg-transparent text-white/80 hover:bg-white/10 hover:text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-rose-600 text-white hover:bg-rose-500"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
