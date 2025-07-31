import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://ljpabdslccothxzyqlmv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqcGFiZHNsY2NvdGh4enlxbG12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDIxNTEsImV4cCI6MjA2OTUxODE1MX0.TxEOCkpgQG4ri-oHy3CARqKIrxD-o1xZ0fF5PLlfMdg'
const supabase = createClient(supabaseUrl, supabaseKey)

export { supabase }