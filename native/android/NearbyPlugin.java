package ir.soheil.breakingcode;

import android.Manifest;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import com.google.android.gms.nearby.Nearby;
import com.google.android.gms.nearby.connection.AdvertisingOptions;
import com.google.android.gms.nearby.connection.ConnectionInfo;
import com.google.android.gms.nearby.connection.ConnectionLifecycleCallback;
import com.google.android.gms.nearby.connection.ConnectionResolution;
import com.google.android.gms.nearby.connection.ConnectionsClient;
import com.google.android.gms.nearby.connection.ConnectionsStatusCodes;
import com.google.android.gms.nearby.connection.DiscoveredEndpointInfo;
import com.google.android.gms.nearby.connection.DiscoveryOptions;
import com.google.android.gms.nearby.connection.EndpointDiscoveryCallback;
import com.google.android.gms.nearby.connection.Payload;
import com.google.android.gms.nearby.connection.PayloadCallback;
import com.google.android.gms.nearby.connection.PayloadTransferUpdate;
import com.google.android.gms.nearby.connection.Strategy;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * پل بین اپ و Google Nearby Connections (بلوتوث + BLE + وای‌فای مستقیم).
 * توپولوژی ستاره‌ای: یه میزبان، بقیه بهش وصل می‌شن.
 */
@CapacitorPlugin(
    name = "Nearby",
    permissions = {
        @Permission(alias = "legacy", strings = { Manifest.permission.ACCESS_FINE_LOCATION }),
        @Permission(alias = "s", strings = {
            Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.ACCESS_FINE_LOCATION }),
        @Permission(alias = "t", strings = {
            Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_ADVERTISE,
            Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.NEARBY_WIFI_DEVICES })
    }
)
public class NearbyPlugin extends Plugin {
    private static final String SERVICE_ID = "ir.soheil.breakingcode.table";
    private static final Strategy STRATEGY = Strategy.P2P_STAR;

    private final Map<String, String> names = new HashMap<>();
    private final Set<String> connected = new HashSet<>();

    private ConnectionsClient client() { return Nearby.getConnectionsClient(getContext()); }

    private String alias() {
        if (Build.VERSION.SDK_INT >= 33) return "t";
        if (Build.VERSION.SDK_INT >= 31) return "s";
        return "legacy";
    }

    private boolean ensurePermissions(PluginCall call, String callback) {
        if (getPermissionState(alias()) == PermissionState.GRANTED) return true;
        requestPermissionForAlias(alias(), call, callback);
        return false;
    }

    // ---------- میزبان ----------
    @PluginMethod
    public void startHosting(PluginCall call) {
        if (ensurePermissions(call, "hostAfterPermission")) doHost(call);
    }

    @PermissionCallback
    private void hostAfterPermission(PluginCall call) {
        if (getPermissionState(alias()) == PermissionState.GRANTED) doHost(call);
        else call.reject("Permission denied");
    }

    private void doHost(PluginCall call) {
        AdvertisingOptions options = new AdvertisingOptions.Builder().setStrategy(STRATEGY).build();
        client().startAdvertising(call.getString("name", "میز"), SERVICE_ID, lifecycle, options)
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }

    // ---------- مهمان ----------
    @PluginMethod
    public void startDiscovery(PluginCall call) {
        if (ensurePermissions(call, "discoverAfterPermission")) doDiscover(call);
    }

    @PermissionCallback
    private void discoverAfterPermission(PluginCall call) {
        if (getPermissionState(alias()) == PermissionState.GRANTED) doDiscover(call);
        else call.reject("Permission denied");
    }

    private void doDiscover(PluginCall call) {
        DiscoveryOptions options = new DiscoveryOptions.Builder().setStrategy(STRATEGY).build();
        client().startDiscovery(SERVICE_ID, discovery, options)
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }

    @PluginMethod
    public void stopDiscovery(PluginCall call) {
        client().stopDiscovery();
        call.resolve();
    }

    @PluginMethod
    public void connect(PluginCall call) {
        String endpointId = call.getString("endpointId");
        if (endpointId == null) { call.reject("endpointId required"); return; }
        client().requestConnection(call.getString("name", "مهمان"), endpointId, lifecycle)
            .addOnSuccessListener(v -> call.resolve())
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }

    // ---------- پیام ----------
    @PluginMethod
    public void send(PluginCall call) {
        String data = call.getString("data", "");
        String endpointId = call.getString("endpointId");
        Payload payload = Payload.fromBytes(data.getBytes(StandardCharsets.UTF_8));
        if (endpointId != null) {
            client().sendPayload(endpointId, payload);
        } else if (!connected.isEmpty()) {
            client().sendPayload(new ArrayList<>(connected), payload);
        }
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        ConnectionsClient c = client();
        c.stopAdvertising();
        c.stopDiscovery();
        c.stopAllEndpoints();
        connected.clear();
        names.clear();
        call.resolve();
    }

    // ---------- callback ها ----------
    private final ConnectionLifecycleCallback lifecycle = new ConnectionLifecycleCallback() {
        @Override
        public void onConnectionInitiated(String endpointId, ConnectionInfo info) {
            names.put(endpointId, info.getEndpointName());
            client().acceptConnection(endpointId, payloads); // بازی رفیقانه‌ست؛ همه رو قبول کن
        }

        @Override
        public void onConnectionResult(String endpointId, ConnectionResolution result) {
            JSObject o = new JSObject();
            o.put("endpointId", endpointId);
            o.put("name", names.get(endpointId));
            if (result.getStatus().getStatusCode() == ConnectionsStatusCodes.STATUS_OK) {
                connected.add(endpointId);
                notifyListeners("connected", o);
            } else {
                notifyListeners("connectFailed", o);
            }
        }

        @Override
        public void onDisconnected(String endpointId) {
            connected.remove(endpointId);
            JSObject o = new JSObject();
            o.put("endpointId", endpointId);
            notifyListeners("disconnected", o);
        }
    };

    private final PayloadCallback payloads = new PayloadCallback() {
        @Override
        public void onPayloadReceived(String endpointId, Payload payload) {
            if (payload.getType() != Payload.Type.BYTES || payload.asBytes() == null) return;
            JSObject o = new JSObject();
            o.put("endpointId", endpointId);
            o.put("data", new String(payload.asBytes(), StandardCharsets.UTF_8));
            notifyListeners("message", o);
        }

        @Override
        public void onPayloadTransferUpdate(String endpointId, PayloadTransferUpdate update) { }
    };

    private final EndpointDiscoveryCallback discovery = new EndpointDiscoveryCallback() {
        @Override
        public void onEndpointFound(String endpointId, DiscoveredEndpointInfo info) {
            JSObject o = new JSObject();
            o.put("endpointId", endpointId);
            o.put("name", info.getEndpointName());
            notifyListeners("endpointFound", o);
        }

        @Override
        public void onEndpointLost(String endpointId) {
            JSObject o = new JSObject();
            o.put("endpointId", endpointId);
            notifyListeners("endpointLost", o);
        }
    };
}
