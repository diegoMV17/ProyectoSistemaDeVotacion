import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeSubscription } from '@supabase/supabase-js';

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  condicion: 'nuevo' | 'usado';
};

type InventarioContextType = {
  productos: Producto[];
  agregarProducto: (producto: Omit<Producto, 'id'>) => Promise<void>;
  editarProducto: (producto: Producto) => Promise<void>;
  cargarProductos: () => void;
  eliminarProducto: (id: string) => Promise<void>;
};

export const InventarioContext = createContext<InventarioContextType>({
  productos: [],
  agregarProducto: async () => {},
  editarProducto: async () => {},
  cargarProductos: () => {},
  eliminarProducto: async () => {},
});

export const InventarioProvider = ({ children }: { children: ReactNode }) => {
  const [productos, setProductos] = useState<Producto[]>([]);

  const cargarProductos = async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    if (data) setProductos(data);
  };

  const agregarProducto = async (producto: Omit<Producto, 'id'>) => {
    const { error } = await supabase.from('productos').insert([producto]);
    if (error) console.error(error);
    await cargarProductos();
  };

  const editarProducto = async (producto: Producto) => {
    const { error } = await supabase
      .from('productos')
      .update({
        nombre: producto.nombre,
        precio: producto.precio,
        condicion: producto.condicion,
      })
      .eq('id', producto.id);
    if (error) console.error(error);
    await cargarProductos();
  };

  const eliminarProducto = async (id: string) => {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) console.error(error);
    await cargarProductos();
  };

  useEffect(() => {
    cargarProductos();

    const subscription: RealtimeSubscription = supabase
      .from('productos')
      .on('*', (payload) => {
        console.log('🔄 Cambio detectado:', payload);
        cargarProductos();
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  return (
    <InventarioContext.Provider
      value={{ productos, agregarProducto, editarProducto, cargarProductos, eliminarProducto }}
    >
      {children}
    </InventarioContext.Provider>
  );
};
