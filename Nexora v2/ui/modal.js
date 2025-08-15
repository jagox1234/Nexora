// v2/ui/modal.js — modal system (migrated)
import { React, useState, createContext, useContext, View, Text, Modal, Pressable } from '../app/dependencies.js';

import { useTheme } from './theme.js';

const ModalCtx = createContext(null);
export const useModal = () => useContext(ModalCtx);

export function ModalProvider({ children }) {
	const t = useTheme();
	const bgCard = t?.color?.card || '#0f1419';
	const textCol = t?.color?.text || '#e5eef5';
	const mutedCol = t?.color?.muted || '#93a3af';
	const border = t?.color?.border || '#1f2933';
	const primary = t?.color?.primary || '#7dd3fc';
	const accent = t?.color?.primaryAlt || '#263238';

	const [state, setState] = useState({ visible:false, title:'', message:'', confirmText:'Confirm', cancelText:'Cancel', onConfirm:null, onCancel:null });
	const hide = () => setState(s => ({ ...s, visible:false }));
	const confirm = ({ title='Confirm', message='', confirmText='Confirm', cancelText='Cancel', onConfirm, onCancel } = {}) => {
		setState({ visible:true, title, message, confirmText, cancelText, onConfirm: onConfirm || null, onCancel: onCancel || null });
	};
	const value = { confirm, hide };
	return (
		<ModalCtx.Provider value={value}>
			{children}
			<Modal visible={!!state.visible} transparent animationType="fade" onRequestClose={hide} accessibilityViewIsModal accessibilityRole="dialog" accessible>
				<View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center', padding:16 }}>
					<View style={{ width:'100%', maxWidth:480, backgroundColor:bgCard, borderRadius:20, borderWidth:1, borderColor:border, overflow:'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }} accessibilityLabel={state.title} accessibilityHint={state.message}>
						<View style={{ padding:16, borderBottomWidth:1, borderBottomColor:border, backgroundColor:accent + '18', borderTopLeftRadius:20, borderTopRightRadius:20 }}>
							<Text style={{ color:textCol, fontSize:20, fontWeight:'700', letterSpacing:0.5 }}>{state.title}</Text>
							{!!state.message && <Text style={{ color:mutedCol, marginTop:8, fontSize:15 }}>{state.message}</Text>}
						</View>
						<View style={{ padding:16, flexDirection:'row', gap:12, backgroundColor:bgCard }}>
							<Pressable style={{ flex:1 }} onPress={() => { state.onCancel?.(); hide(); }}>
								<View style={{ paddingVertical:14, alignItems:'center', borderWidth:1, borderColor:border, borderRadius:12, backgroundColor: mutedCol + '22' }}>
									<Text style={{ color:textCol, fontWeight:'600', fontSize:16 }}>{state.cancelText}</Text>
								</View>
							</Pressable>
							<Pressable style={{ flex:1 }} onPress={() => { state.onConfirm?.(); hide(); }}>
								<View style={{ paddingVertical:14, alignItems:'center', borderWidth:1, borderColor:primary, backgroundColor: primary + '44', borderRadius:12, boxShadow: '0 2px 12px ' + accent + '33' }}>
									<Text style={{ color:primary, fontWeight:'700', fontSize:16 }}>{state.confirmText}</Text>
								</View>
							</Pressable>
						</View>
					</View>
				</View>
			</Modal>
		</ModalCtx.Provider>
	);
}
