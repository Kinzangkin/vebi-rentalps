'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatPrice, getStatusColor } from '@/lib/utils/helpers'
import { toast } from 'react-hot-toast'
import { Plus, Pencil, Trash2, Loader2, Gamepad2 } from 'lucide-react'
import type { PsUnit, PsUnitType, PsUnitStatus } from '@/types'

const emptyUnit = {
  name: '',
  type: 'PS5' as PsUnitType,
  tv_size: '',
  price_per_hour: 0,
  status: 'available' as PsUnitStatus,
  image_url: '',
}

export default function UnitsPage() {
  const supabase = createClient()
  const [units, setUnits] = useState<PsUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<PsUnit | null>(null)
  const [form, setForm] = useState(emptyUnit)
  const [submitting, setSubmitting] = useState(false)

  async function fetchUnits() {
    const { data } = await supabase
      .from('ps_units')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setUnits(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchUnits()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openCreate() {
    setEditingUnit(null)
    setForm(emptyUnit)
    setDialogOpen(true)
  }

  function openEdit(unit: PsUnit) {
    setEditingUnit(unit)
    setForm({
      name: unit.name,
      type: unit.type,
      tv_size: unit.tv_size,
      price_per_hour: unit.price_per_hour,
      status: unit.status,
      image_url: unit.image_url || '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    if (editingUnit) {
      const { error } = await supabase
        .from('ps_units')
        .update({
          name: form.name,
          type: form.type,
          tv_size: form.tv_size,
          price_per_hour: form.price_per_hour,
          status: form.status,
          image_url: form.image_url || null,
        })
        .eq('id', editingUnit.id)

      if (error) {
        toast.error('Gagal mengupdate unit: ' + error.message)
      } else {
        toast.success('Unit berhasil diupdate!')
      }
    } else {
      const { error } = await supabase.from('ps_units').insert({
        name: form.name,
        type: form.type,
        tv_size: form.tv_size,
        price_per_hour: form.price_per_hour,
        status: form.status,
        image_url: form.image_url || null,
      })

      if (error) {
        toast.error('Gagal menambah unit: ' + error.message)
      } else {
        toast.success('Unit berhasil ditambahkan!')
      }
    }

    setSubmitting(false)
    setDialogOpen(false)
    fetchUnits()
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus unit ini?')) return

    const { error } = await supabase.from('ps_units').delete().eq('id', id)
    if (error) {
      toast.error('Gagal menghapus unit: ' + error.message)
    } else {
      toast.success('Unit berhasil dihapus!')
      fetchUnits()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Unit PS</h1>
          <p className="text-muted-foreground">Kelola semua unit PlayStation.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />} onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" /> Tambah Unit
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUnit ? 'Edit Unit' : 'Tambah Unit Baru'}</DialogTitle>
              <DialogDescription>
                {editingUnit ? 'Update informasi unit PlayStation.' : 'Tambahkan unit PlayStation baru.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Unit</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="PS5 - Unit 1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select value={form.type} onValueChange={(v) => v && setForm({ ...form, type: v as PsUnitType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PS4">PS4</SelectItem>
                      <SelectItem value="PS5">PS5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tv_size">TV Size</Label>
                  <Input
                    id="tv_size"
                    value={form.tv_size}
                    onChange={(e) => setForm({ ...form, tv_size: e.target.value })}
                    placeholder="32 inch"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Harga per Jam (Rp)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price_per_hour || ''}
                    onChange={(e) => setForm({ ...form, price_per_hour: Number(e.target.value) })}
                    placeholder="15000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v as PsUnitStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingUnit ? 'Update' : 'Tambah'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : units.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Gamepad2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
              <p>Belum ada unit PlayStation.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>TV</TableHead>
                  <TableHead>Harga/Jam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell>{unit.type}</TableCell>
                    <TableCell>{unit.tv_size}</TableCell>
                    <TableCell>{formatPrice(unit.price_per_hour)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(unit.status)}>
                        {unit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(unit)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(unit.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
