import Button from "../../atoms/Button";

export default function SecurityTab() {
    const lastLogin =
        localStorage.getItem("lastLogin") ||
        new Date().toLocaleString();

    return (
        <div className="rounded-xl border bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">
                Security
            </h2>
            <p className="mt-1 text-sm text-gray-600">
                Manage your account security.
            </p>

            <div className="mt-6 space-y-4">
                {/* Last login */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-slate-800">Last login</p>
                        <p className="text-sm text-gray-500">{lastLogin}</p>
                    </div>
                </div>

                <hr />

                {/* Change password */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-slate-800">Password</p>
                        <p className="text-sm text-gray-500">
                            Change your account password
                        </p>
                    </div>
                    <Button disabled>Change password</Button>
                </div>

                {/* Logout everywhere */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-slate-800">
                            Active sessions
                        </p>
                        <p className="text-sm text-gray-500">
                            Log out from all devices
                        </p>
                    </div>
                    <Button disabled>Log out all</Button>
                </div>
            </div>
        </div>
    );
}
