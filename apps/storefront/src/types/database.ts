export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          created_at: string
          district: string | null
          id: string
          is_default: boolean
          line1: string
          line2: string | null
          phone: string
          postal_code: string | null
          province: string
          recipient: string
          updated_at: string
          user_id: string
          ward: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          id?: string
          is_default?: boolean
          line1: string
          line2?: string | null
          phone: string
          postal_code?: string | null
          province: string
          recipient: string
          updated_at?: string
          user_id: string
          ward?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          id?: string
          is_default?: boolean
          line1?: string
          line2?: string | null
          phone?: string
          postal_code?: string | null
          province?: string
          recipient?: string
          updated_at?: string
          user_id?: string
          ward?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: number
          request_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: number
          request_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: number
          request_id?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          quantity: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          quantity: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          currency: string
          expires_at: string
          guest_token_hash: string | null
          id: string
          status: Database["public"]["Enums"]["cart_state"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          currency?: string
          expires_at?: string
          guest_token_hash?: string | null
          id?: string
          status?: Database["public"]["Enums"]["cart_state"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          currency?: string
          expires_at?: string
          guest_token_hash?: string | null
          id?: string
          status?: Database["public"]["Enums"]["cart_state"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          audience: string | null
          created_at: string
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          audience?: string | null
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          audience?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_products: {
        Row: {
          collection_id: string
          position: number
          product_id: string
        }
        Insert: {
          collection_id: string
          position?: number
          product_id: string
        }
        Update: {
          collection_id?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_sections: {
        Row: {
          active: boolean
          created_at: string
          ends_at: string | null
          id: string
          page_key: string
          payload: Json
          position: number
          starts_at: string | null
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          page_key: string
          payload?: Json
          position?: number
          starts_at?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          page_key?: string
          payload?: Json
          position?: number
          starts_at?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupon_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          id: string
          per_member_limit: number | null
          promotion_id: string
          usage_limit: number | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          id?: string
          per_member_limit?: number | null
          promotion_id: string
          usage_limit?: number | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          id?: string
          per_member_limit?: number | null
          promotion_id?: string
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_codes_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          amount: number
          coupon_id: string
          created_at: string
          id: string
          order_id: string
          user_id: string | null
        }
        Insert: {
          amount: number
          coupon_id: string
          created_at?: string
          id?: string
          order_id: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          coupon_id?: string
          created_at?: string
          id?: string
          order_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupon_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_inventory_snapshots: {
        Row: {
          available: number
          inventory_value: number | null
          on_hand: number
          reserved: number
          snapshot_date: string
          variant_id: string
        }
        Insert: {
          available: number
          inventory_value?: number | null
          on_hand: number
          reserved: number
          snapshot_date: string
          variant_id: string
        }
        Update: {
          available?: number
          inventory_value?: number | null
          on_hand?: number
          reserved?: number
          snapshot_date?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_inventory_snapshots_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_sales_metrics: {
        Row: {
          discounts: number
          gross_revenue: number
          metric_date: string
          net_revenue: number
          paid_orders: number
          rebuilt_at: string
          refunds: number
          units_sold: number
        }
        Insert: {
          discounts?: number
          gross_revenue?: number
          metric_date: string
          net_revenue?: number
          paid_orders?: number
          rebuilt_at?: string
          refunds?: number
          units_sold?: number
        }
        Update: {
          discounts?: number
          gross_revenue?: number
          metric_date?: string
          net_revenue?: number
          paid_orders?: number
          rebuilt_at?: string
          refunds?: number
          units_sold?: number
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          on_hand: number
          reorder_level: number
          reserved: number
          unit_cost: number | null
          updated_at: string
          variant_id: string
        }
        Insert: {
          on_hand?: number
          reorder_level?: number
          reserved?: number
          unit_cost?: number | null
          updated_at?: string
          variant_id: string
        }
        Update: {
          on_hand?: number
          reorder_level?: number
          reserved?: number
          unit_cost?: number | null
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          actor_id: string | null
          created_at: string
          id: number
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          type: string
          variant_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: number
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type: string
          variant_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: number
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reservations: {
        Row: {
          cart_id: string | null
          created_at: string
          expires_at: string
          id: string
          order_id: string | null
          quantity: number
          status: Database["public"]["Enums"]["reservation_state"]
          variant_id: string
        }
        Insert: {
          cart_id?: string | null
          created_at?: string
          expires_at: string
          id?: string
          order_id?: string | null
          quantity: number
          status?: Database["public"]["Enums"]["reservation_state"]
          variant_id: string
        }
        Update: {
          cart_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["reservation_state"]
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt_text: string
          created_at: string
          height: number | null
          id: string
          object_key: string
          product_id: string
          provider: string
          rights_status: string
          sort_order: number
          variant_id: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string
          created_at?: string
          height?: number | null
          id?: string
          object_key: string
          product_id: string
          provider?: string
          rights_status?: string
          sort_order?: number
          variant_id?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string
          created_at?: string
          height?: number | null
          id?: string
          object_key?: string
          product_id?: string
          provider?: string
          rights_status?: string
          sort_order?: number
          variant_id?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_assets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_assets_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      member_status: {
        Row: {
          reason: string | null
          status: Database["public"]["Enums"]["member_state"]
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          reason?: string | null
          status?: Database["public"]["Enums"]["member_state"]
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          reason?: string | null
          status?: Database["public"]["Enums"]["member_state"]
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          consented_at: string | null
          created_at: string
          email: string
          id: string
          status: string
          unsubscribed_at: string | null
        }
        Insert: {
          consented_at?: string | null
          created_at?: string
          email: string
          id?: string
          status?: string
          unsubscribed_at?: string | null
        }
        Update: {
          consented_at?: string | null
          created_at?: string
          email?: string
          id?: string
          status?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      option_values: {
        Row: {
          id: string
          option_id: string
          position: number
          swatch_hex: string | null
          value: string
        }
        Insert: {
          id?: string
          option_id: string
          position?: number
          swatch_hex?: string | null
          value: string
        }
        Update: {
          id?: string
          option_id?: string
          position?: number
          swatch_hex?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          discount_total: number
          id: string
          image_url: string | null
          line_total: number
          order_id: string
          product_name: string
          quantity: number
          sku: string
          unit_price: number
          variant_id: string | null
          variant_name: string
        }
        Insert: {
          discount_total?: number
          id?: string
          image_url?: string | null
          line_total: number
          order_id: string
          product_name: string
          quantity: number
          sku: string
          unit_price: number
          variant_id?: string | null
          variant_name: string
        }
        Update: {
          discount_total?: number
          id?: string
          image_url?: string | null
          line_total?: number
          order_id?: string
          product_name?: string
          quantity?: number
          sku?: string
          unit_price?: number
          variant_id?: string | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          checkout_token: string | null
          created_at: string
          currency: string
          discount_total: number
          email: string
          fulfillment_status: Database["public"]["Enums"]["fulfillment_state"]
          grand_total: number
          id: string
          opened_at: string | null
          order_number: string
          payment_status: Database["public"]["Enums"]["payment_state"]
          phone: string | null
          placed_at: string | null
          shipping_address: Json
          shipping_total: number
          status: Database["public"]["Enums"]["order_state"]
          subtotal: number
          tax_total: number
          updated_at: string
          user_id: string | null
          version: number
        }
        Insert: {
          billing_address?: Json | null
          checkout_token?: string | null
          created_at?: string
          currency?: string
          discount_total?: number
          email: string
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_state"]
          grand_total: number
          id?: string
          opened_at?: string | null
          order_number: string
          payment_status?: Database["public"]["Enums"]["payment_state"]
          phone?: string | null
          placed_at?: string | null
          shipping_address: Json
          shipping_total?: number
          status?: Database["public"]["Enums"]["order_state"]
          subtotal: number
          tax_total?: number
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Update: {
          billing_address?: Json | null
          checkout_token?: string | null
          created_at?: string
          currency?: string
          discount_total?: number
          email?: string
          fulfillment_status?: Database["public"]["Enums"]["fulfillment_state"]
          grand_total?: number
          id?: string
          opened_at?: string | null
          order_number?: string
          payment_status?: Database["public"]["Enums"]["payment_state"]
          phone?: string | null
          placed_at?: string | null
          shipping_address?: Json
          shipping_total?: number
          status?: Database["public"]["Enums"]["order_state"]
          subtotal?: number
          tax_total?: number
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Relationships: []
      }
      payment_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          payload_hash: string
          processed_at: string | null
          provider: string
          provider_event_id: string
          status: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: number
          payload_hash: string
          processed_at?: string | null
          provider: string
          provider_event_id: string
          status?: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: number
          payload_hash?: string
          processed_at?: string | null
          provider?: string
          provider_event_id?: string
          status?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          idempotency_key: string
          order_id: string
          provider: string
          provider_payment_id: string | null
          raw_reference: Json | null
          status: Database["public"]["Enums"]["payment_state"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key: string
          order_id: string
          provider: string
          provider_payment_id?: string | null
          raw_reference?: Json | null
          status?: Database["public"]["Enums"]["payment_state"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          idempotency_key?: string
          order_id?: string
          provider?: string
          provider_payment_id?: string | null
          raw_reference?: Json | null
          status?: Database["public"]["Enums"]["payment_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          changed_by: string | null
          effective_at: string
          id: number
          new_price: number
          old_price: number | null
          reason: string | null
          variant_id: string
        }
        Insert: {
          changed_by?: string | null
          effective_at?: string
          id?: number
          new_price: number
          old_price?: number | null
          reason?: string | null
          variant_id: string
        }
        Update: {
          changed_by?: string | null
          effective_at?: string
          id?: number
          new_price?: number
          old_price?: number | null
          reason?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          id: string
          name: string
          position: number
          product_id: string
        }
        Insert: {
          id?: string
          name: string
          position?: number
          product_id: string
        }
        Update: {
          id?: string
          name?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          active: boolean
          compare_at_amount: number | null
          created_at: string
          currency: string
          id: string
          price_amount: number
          product_id: string
          sku: string
          title: string
          updated_at: string
          weight_grams: number | null
        }
        Insert: {
          active?: boolean
          compare_at_amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          price_amount: number
          product_id: string
          sku: string
          title: string
          updated_at?: string
          weight_grams?: number | null
        }
        Update: {
          active?: boolean
          compare_at_amount?: number | null
          created_at?: string
          currency?: string
          id?: string
          price_amount?: number
          product_id?: string
          sku?: string
          title?: string
          updated_at?: string
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          featured: boolean
          id: string
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          source_key: string | null
          status: Database["public"]["Enums"]["product_state"]
          subtitle: string | null
          updated_at: string
          version: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          source_key?: string | null
          status?: Database["public"]["Enums"]["product_state"]
          subtitle?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          source_key?: string | null
          status?: Database["public"]["Enums"]["product_state"]
          subtitle?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promotion_targets: {
        Row: {
          id: string
          promotion_id: string
          target_id: string | null
          target_type: Database["public"]["Enums"]["target_kind"]
        }
        Insert: {
          id?: string
          promotion_id: string
          target_id?: string | null
          target_type: Database["public"]["Enums"]["target_kind"]
        }
        Update: {
          id?: string
          promotion_id?: string
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["target_kind"]
        }
        Relationships: [
          {
            foreignKeyName: "promotion_targets_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string
          created_by: string | null
          discount_type: Database["public"]["Enums"]["discount_kind"]
          discount_value: number
          ends_at: string | null
          id: string
          min_order_amount: number
          name: string
          priority: number
          stackable: boolean
          starts_at: string | null
          status: Database["public"]["Enums"]["promotion_state"]
          updated_at: string
          usage_limit: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          discount_type: Database["public"]["Enums"]["discount_kind"]
          discount_value: number
          ends_at?: string | null
          id?: string
          min_order_amount?: number
          name: string
          priority?: number
          stackable?: boolean
          starts_at?: string | null
          status?: Database["public"]["Enums"]["promotion_state"]
          updated_at?: string
          usage_limit?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          discount_type?: Database["public"]["Enums"]["discount_kind"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          min_order_amount?: number
          name?: string
          priority?: number
          stackable?: boolean
          starts_at?: string | null
          status?: Database["public"]["Enums"]["promotion_state"]
          updated_at?: string
          usage_limit?: number | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string
          payment_id: string
          provider_refund_id: string | null
          reason: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          order_id: string
          payment_id: string
          provider_refund_id?: string | null
          reason: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          payment_id?: string
          provider_refund_id?: string | null
          reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string
          delivered_at: string | null
          id: string
          order_id: string
          shipped_at: string | null
          status: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          order_id: string
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          id?: string
          order_id?: string
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      slug_redirects: {
        Row: {
          created_at: string
          entity_type: string
          id: number
          new_slug: string
          old_slug: string
        }
        Insert: {
          created_at?: string
          entity_type: string
          id?: number
          new_slug: string
          old_slug: string
        }
        Update: {
          created_at?: string
          entity_type?: string
          id?: number
          new_slug?: string
          old_slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: number
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: number
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: number
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      variant_option_values: {
        Row: {
          option_value_id: string
          variant_id: string
        }
        Insert: {
          option_value_id: string
          variant_id: string
        }
        Update: {
          option_value_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_option_values_option_value_id_fkey"
            columns: ["option_value_id"]
            isOneToOne: false
            referencedRelation: "option_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_option_values_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      place_cod_order: {
        Args: {
          p_checkout_token: string
          p_email: string
          p_items: Json
          p_phone: string
          p_shipping_address: Json
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "customer" | "staff" | "admin"
      cart_state: "active" | "converted" | "abandoned" | "expired"
      discount_kind: "percentage" | "fixed_amount"
      fulfillment_state:
        | "unfulfilled"
        | "processing"
        | "partially_shipped"
        | "shipped"
        | "delivered"
        | "cancelled"
      member_state: "active" | "blocked"
      order_state:
        | "pending_payment"
        | "paid"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
      payment_state:
        | "pending"
        | "authorized"
        | "paid"
        | "failed"
        | "cancelled"
        | "refunded"
        | "partially_refunded"
      product_state: "draft" | "published" | "archived"
      promotion_state: "draft" | "scheduled" | "active" | "paused" | "expired"
      reservation_state: "active" | "released" | "converted" | "expired"
      target_kind: "all" | "category" | "collection" | "product" | "variant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "staff", "admin"],
      cart_state: ["active", "converted", "abandoned", "expired"],
      discount_kind: ["percentage", "fixed_amount"],
      fulfillment_state: [
        "unfulfilled",
        "processing",
        "partially_shipped",
        "shipped",
        "delivered",
        "cancelled",
      ],
      member_state: ["active", "blocked"],
      order_state: [
        "pending_payment",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      payment_state: [
        "pending",
        "authorized",
        "paid",
        "failed",
        "cancelled",
        "refunded",
        "partially_refunded",
      ],
      product_state: ["draft", "published", "archived"],
      promotion_state: ["draft", "scheduled", "active", "paused", "expired"],
      reservation_state: ["active", "released", "converted", "expired"],
      target_kind: ["all", "category", "collection", "product", "variant"],
    },
  },
} as const
